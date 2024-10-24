import { Logger, NotificationTypes } from "@medusajs/types";
import {
  AbstractNotificationProviderService,
  MedusaError,
} from "@medusajs/utils";
import { Resend, CreateEmailOptions } from "resend";

type InjectedDependencies = {
  logger: Logger;
};

interface ResendServiceConfig {
  apiKey: string;
  from: string;
}
export interface ResendNotificationServiceOptions {
  api_key: string;
  from: string;
}

export class ResendNotificationService extends AbstractNotificationProviderService {
  static identifier = "resend";
  protected config_: ResendServiceConfig;
  protected logger_: Logger;
  protected resend: Resend;

  constructor(
    { logger }: InjectedDependencies,
    options: ResendNotificationServiceOptions
  ) {
    super();

    this.config_ = {
      apiKey: options.api_key,
      from: options.from,
    };
    this.logger_ = logger;
    this.resend = new Resend(this.config_.apiKey);
  }

  async send(
    notification: NotificationTypes.ProviderSendNotificationDTO
  ): Promise<NotificationTypes.ProviderSendNotificationResultsDTO> {
    if (!notification) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `No notification information provided`
      );
    }
    if (notification.channel === "sms") {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `SMS notification not supported`
      );
    }

    const attachments = Array.isArray(notification.attachments)
      ? notification.attachments.map((attachment) => ({
          content: attachment.content, // Base64 encoded string of the file
          filename: attachment.filename,
          content_type: attachment.content_type, // MIME type (e.g., 'application/pdf')
          disposition: attachment.disposition ?? "attachment", // Default to 'attachment'
          id: attachment.id ?? undefined, // Optional: unique identifier for inline attachments
        }))
      : undefined;

    const from = notification.from?.trim() || this.config_.from;
    const text = String(notification.data?.text) || "";
    const subject = String(notification.data?.subject) || "";
    const message: CreateEmailOptions = {
      to: notification.to,
      from: from,
      text: text,
      html: notification.template,
      subject,
      attachments: attachments,
    };

    try {
      // Unfortunately we don't get anything useful back in the response
      await this.resend.emails.send(message);
      return {};
    } catch (error) {
      const errorCode = error.code;
      const responseError = error.response?.body?.errors?.[0];
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to send resend email: ${errorCode} - ${
          responseError?.message ?? "unknown error"
        }`
      );
    }
  }
}

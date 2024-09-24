# medusa-notification-resend
Resend notification sender for medusa 2.x. 

## Setup
```bash npm2yarn
yarn add @typed-dev/medusa-notification-resend
```
## Configure
```js title="medusa-config.js"
const { Modules } = require("@medusajs/utils")

// ...

module.exports = defineConfig({
  // ...
  modules: {
    [Modules.NOTIFICATION]: {
      resolve: "@medusajs/notification",
      options: {
        providers: [
          // ...
          {
            resolve: "@typed-dev/medusa-notification-resend",
            id: "resend",
            options: {
              channels: ["email"],
              api_key: process.env.RESEND_API_KEY,
              from: process.env.RESEND_FROM,
            },
          },
        ],
      },
    },
  },
})
```

## Environment Variables

Make sure to add the following environment variables:

```bash
RESEND_API_KEY=<YOUR_RESEND_API_KEY>
RESEND_FROM=<YOUR_RESEND_FROM>
```


## Using the module
```typescript
import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/medusa"
import { Modules } from "@medusajs/utils"
import { INotificationModuleService } from "@medusajs/types"

export default async function productCreateHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const notificationModuleService: INotificationModuleService =
    container.resolve(Modules.NOTIFICATION)

  await notificationModuleService.createNotifications({
    to: "test@gmail.com",
    from: "test@medusajs.com", // Optional var, verified sender required
    channel: "email",
    template: "<strong>It works!</strong>",
    data: {
        ...data,
        subject: "My subject",
        text: "My fallback text"
    }
    attachments: [ // optional var
      {
        content: base64,
        content_type: "image/png", // mime type
        filename: filename.ext,
        disposition: "attachment or inline attachment",
        id: "id", // only needed for inline attachment
      },
    ],
  })
}

export const config: SubscriberConfig = {
  event: "product.created",
}
```
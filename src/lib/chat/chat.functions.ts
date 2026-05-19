import { createServerFn } from "@tanstack/react-start";
import { chatRequestSchema } from "./chat.schemas";
import { sendChatMessage } from "./chat.server";

export const sendChatMessageFn = createServerFn({ method: "POST" })
  .inputValidator((input) => chatRequestSchema.parse(input))
  .handler(async ({ data }) => {
    return sendChatMessage(data);
  });

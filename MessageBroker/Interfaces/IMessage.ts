/**
 * Represents a generic message structure with a type identifier and optional payload.
 *
 * @property type - A string that identifies the type of the message.
 * @property payload - Optional data associated with the message. Can be of any type.
 */
export interface IMessage {
  /** Required: The message type (e.g. "FormSubmit", "Notification", etc) */
  type: string;

  /** Optional: Topic or channel for grouping */
  topic?: string;

  /** Optional: Payload, may be any serializable data */
  payload?: any;

  /** Optional: The unique id for this message (e.g. for requests/replies) */
  id?: string;

  /** Optional: Sender info (useful for distributed scenarios) */
  from?: string;

  /** Optional: Target info (used for routing) */
  to?: string;

  /** Optional: ISO timestamp (set by sender, if needed) */
  timestamp?: string;

  /** Optional: True if message originated locally (not from remote transport) */
  _remote?: boolean;

  /** --- Optional fields for Request/Reply/RPC patterns --- */
  _isRequest?: boolean;
  _isReply?: boolean;
  replyTo?: string;
  connectionId?: string;
}




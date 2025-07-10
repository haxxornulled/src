import { IMessage } from "../../MessageBroker/Interfaces/IMessage";

export interface UIBinderMsg extends IMessage {
  payload?: {
    formId?: string;
    formName?: string;
    name?: string;
    field?: string;
    result?: { valid: boolean; message?: string };
    message?: string;
    level?: 'info' | 'success' | 'error';
  };
}
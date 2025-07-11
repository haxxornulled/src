
export interface IRuleDescriptor {
  /** Core type: "required", "minLength", "remote", etc */
  type: string;
  /** Value for the rule (number, string, etc) */
  value?: any;
  /** Optional remote type (for remote validation) */
  remoteType?: string;
  /** Remote validation provider key */
  provider?: string;
  /** Remote endpoint path/url */
  endpoint?: string;
  /** Error message override */
  message?: string;
  /** Field name for configuration lookup */
  fieldName?: string;
  /** [Anything else for custom rule data] */
  [key: string]: any;
}

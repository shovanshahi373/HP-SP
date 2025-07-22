import { ALERTS } from "./constants";

export type ALERT_TYPE = (typeof ALERTS)[keyof typeof ALERTS];

export interface Alert {
  type: ALERT_TYPE;
  icon: string;
  message: string;
  title: string;
}

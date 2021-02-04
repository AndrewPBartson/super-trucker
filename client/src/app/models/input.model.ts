import { Time } from '@angular/common';

export interface InputModel {
  origin: string;
  end_point: string;
  miles_per_day: number;
  depart_time?: Date;
  timezone_user: string;
  time_str_user: string;
  defaultOpt?: boolean;
  cycle_24_hour?: boolean;
  avg_speed?: number;
  hours_driving?: number;
  resume_time?: Time;
  hours_rest?: number;
  meters_per_day?: number;
  delay_time?: number;
  weather?: boolean;
  hotels?: boolean;
  truck_stops?: boolean;
}

export interface InputModel {
  avg_speed?: number;
  depart_time?: Date;
  depart_time_msec?: number;
  end_point: string;
  hotels?: boolean;
  hours_driving?: number;
  miles_per_day: number;
  origin: string;
  time_user_str: string;
  timezone_user: string;
  truck_stops?: boolean;
  weather?: boolean;
  // defaultOpt?: boolean;
  // cycle_24_hour?: boolean;
  // resume_time?: Time;
  // hours_rest?: number;
  // meters_per_day?: number;
  // delay_time?: number;
}

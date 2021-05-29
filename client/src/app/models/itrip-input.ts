export interface ITripInput {
  avg_speed?: number;
  depart_time?: Date;
  end_point: string;
  hotels?: boolean;
  hours_driving?: number;
  miles_per_day?: number;
  origin: string;
  time_user_str: string;
  timezone_user: string;
  truck_stops?: boolean;
  weather?: boolean;
}

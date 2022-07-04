export interface ITrip {
  days: [
    {
      time_points: [
        {
          city_state: string
          miles_today: string
          hours_today: string
          time_local: string
          time_user: string
          date_local: string
          date_local_short: string
          date_local_long: string
          date_user: string
          status: string
          temperature: number
          text: string
          icon: string
        }
      ]
    }
  ],
  markers: [
    {
      city_state: string
      lat: number
      lng: number
      date: string
      date_time: string
      icon: string
      text: string
      time: string
      time_user: string
      restart?: {
        city_state?: string
        date?: string
        date_time?: string
        icon?: string
        text?: string
        time?: string
        time_user?: string
      }
    }
  ],
  overview: {
    origin: string
    end_point: string
    summary: string
    total_mi: number
    bounds: {
      northeast: { lat: number, lng: number }
      southwest: { lat: number, lng: number }
    }
  }
  // time_points?: [],
  // weather?: []
}

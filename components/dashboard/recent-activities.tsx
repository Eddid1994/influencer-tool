import { formatDistanceToNow } from 'date-fns'

interface Activity {
  id: string
  activity_type: string
  description: string | null
  created_at: string
}

interface RecentActivitiesProps {
  activities: Activity[]
}

export default function RecentActivities({ activities }: RecentActivitiesProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No recent activities
      </div>
    )
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'email_sent':
        return '📧'
      case 'call_made':
        return '📞'
      case 'meeting_scheduled':
        return '📅'
      case 'contract_signed':
        return '✅'
      default:
        return '📝'
    }
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-3">
          <div className="text-2xl">{getActivityIcon(activity.activity_type)}</div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {activity.description || activity.activity_type.replace('_', ' ').charAt(0).toUpperCase() + activity.activity_type.replace('_', ' ').slice(1)}
            </p>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
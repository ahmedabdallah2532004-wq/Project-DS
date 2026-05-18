module.exports = {
  UPLOAD_COMPLETED: {
    type: 'object',
    properties: {
      file_id: { type: 'string' },
      user_id: { type: 'string' },
      size: { type: 'number' },
      storage_path: { type: 'string' }
    },
    required: ['file_id', 'user_id']
  },
  BACKUP_COMPLETED: {
    type: 'object',
    properties: {
      backup_id: { type: 'string' },
      status: { type: 'string' },
      completed_at: { type: 'string' }
    },
    required: ['backup_id', 'status']
  },
  NOTIFICATION_SENT: {
    type: 'object',
    properties: {
      notification_id: { type: 'string' },
      recipient: { type: 'string' },
      type: { type: 'string' }
    },
    required: ['notification_id', 'recipient']
  },
  METRICS_THRESHOLD_EXCEEDED: {
    type: 'object',
    properties: {
      metric_name: { type: 'string' },
      value: { type: 'number' },
      threshold: { type: 'number' }
    },
    required: ['metric_name', 'value']
  }
};

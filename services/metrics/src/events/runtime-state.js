import { env } from '../config/env.js';

const state = {
  defaultThreshold: env.DEFAULT_THRESHOLD,
  alertsEnabled: env.ENABLE_THRESHOLD_ALERTS,
  kafkaConnected: false
};

export function getRuntimeState() {
  return state;
}

export function setKafkaConnected(value) {
  state.kafkaConnected = value;
}

export function applyConfigEvent(payload) {
  if (payload?.service !== env.SERVICE_NAME) {
    return false;
  }

  if (payload.key === 'DEFAULT_THRESHOLD') {
    state.defaultThreshold = Number(payload.value);
    return true;
  }

  return false;
}

export function applyFlagEvent(payload) {
  if (payload?.service !== env.SERVICE_NAME) {
    return false;
  }

  if (payload.name === 'ENABLE_THRESHOLD_ALERTS') {
    state.alertsEnabled = Boolean(payload.enabled);
    return true;
  }

  return false;
}

const API_BASE_URL = "http://localhost:8080/api";

export const severityConfig = {
  critical: {
    label: "Критический",
    variant: "destructive",
    className: "",
  },
  high: {
    label: "Высокий",
    variant: "outline",
    className: "border-orange-500 text-orange-500",
  },
  medium: {
    label: "Средний",
    variant: "secondary",
    className: "border-yellow-500 text-yellow-500",
  },
  low: {
    label: "Низкий",
    variant: "outline",
    className: "border-blue-500 text-blue-500",
  },
  info: {
    label: "Инфо",
    variant: "secondary",
    className: "",
  },
};

export const statusConfig = {
  new: {
    label: "Новое",
    variant: "destructive",
    className: "",
  },
  in_progress: {
    label: "В работе",
    variant: "outline",
    className: "border-blue-500 text-blue-500",
  },
  acknowledged: {
    label: "Подтверждено",
    variant: "secondary",
    className: "",
  },
  resolved: {
    label: "Решено",
    variant: "outline",
    className: "border-green-500 text-green-500",
  },
};

export async function fetchAlerts() {
  const response = await fetch(`${API_BASE_URL}/alerts`);
  if (!response.ok) {
    throw new Error(`Failed to fetch alerts: ${response.status}`);
  }
  return response.json();
}

export async function fetchAlertById(id) {
  const response = await fetch(`${API_BASE_URL}/alerts/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch alert: ${response.status}`);
  }
  return response.json();
}

export async function createAlert(alertData) {
  const response = await fetch(`${API_BASE_URL}/alert`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(alertData),
  });
  if (!response.ok) {
    throw new Error(`Failed to create alert: ${response.status}`);
  }
  return response.json();
}

export async function updateAlertStatus(id, status) {
  const response = await fetch(`${API_BASE_URL}/alerts/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    throw new Error(`Failed to update alert status: ${response.status}`);
  }
  return response.json();
}

export async function deleteAlert(id) {
  const response = await fetch(`${API_BASE_URL}/alerts/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Failed to delete alert: ${response.status}`);
  }
  return response.json();
}

export async function banIP(ip) {
  const response = await fetch(`${API_BASE_URL}/alerts/ban-ip`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ip }),
  });
  if (!response.ok) {
    throw new Error(`Failed to ban IP: ${response.status}`);
  }
  return response.json();
}

export async function freezeUser(userId) {
  const response = await fetch(`${API_BASE_URL}/alerts/freeze-user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId }),
  });
  if (!response.ok) {
    throw new Error(`Failed to freeze user: ${response.status}`);
  }
  return response.json();
}

export async function banUser(userId) {
  const response = await fetch(`${API_BASE_URL}/alerts/ban-user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId }),
  });
  if (!response.ok) {
    throw new Error(`Failed to ban user: ${response.status}`);
  }
  return response.json();
}

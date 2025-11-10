const API_BASE = import.meta.env.VITE_API_BASE || '';

async function request(path, { method = 'GET', body, headers = {}, ...rest } = {}) {
	console.log(`Making ${method} request to ${API_BASE}${path}`);
	
	const res = await fetch(`${API_BASE}${path}`, {
		method,
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
			...headers
		},
		body: body ? JSON.stringify(body) : undefined,
		...rest
	});
	
	console.log(`Response status: ${res.status}`);
	
	if (!res.ok) {
		const text = await res.text();
		console.error(`API error: ${method} ${path} failed: ${res.status} ${text}`);
		throw new Error(`API ${method} ${path} failed: ${res.status} ${text}`);
	}
	const contentType = res.headers.get('content-type') || '';
	if (contentType.includes('application/json')) return res.json();
	return res.text();
}

export const apiClient = {
	get: (path, options = {}) => request(path, { method: 'GET', ...options }),
	post: (path, data, options = {}) => request(path, { method: 'POST', body: data, ...options }),
	put: (path, data, options = {}) => request(path, { method: 'PUT', body: data, ...options }),
	patch: (path, data, options = {}) => request(path, { method: 'PATCH', body: data, ...options }),
	delete: (path, options = {}) => request(path, { method: 'DELETE', ...options })
};

export function getMe() {
	return apiClient.get('/auth/me');
}

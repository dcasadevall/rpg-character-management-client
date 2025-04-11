import { NextRequest, NextResponse } from 'next/server';

// const API_BASE_URL = 'http://localhost:5266/api/v1';
const API_BASE_URL = 'https://dcasadevall.com/api/v1';
const FALLBACK_API_BASE_URL = 'https://api.dcasadevall.com/api/v1';

// Helper function to make API calls with fallback
async function fetchWithFallback(url: string, options?: RequestInit): Promise<Response> {
    try {
        const response = await fetch(url, options);
        if (response.status === 500) {
            // If we get a 500 error, try the fallback URL
            const fallbackUrl = url.replace(API_BASE_URL, FALLBACK_API_BASE_URL);
            return await fetch(fallbackUrl, options);
        }
        return response;
    } catch (error) {
        // If the first request fails, try the fallback URL
        const fallbackUrl = url.replace(API_BASE_URL, FALLBACK_API_BASE_URL);
        return await fetch(fallbackUrl, options);
    }
}

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
    const path = params.path.join('/');
    const url = `${API_BASE_URL}/${path}${request.nextUrl.search}`;

    try {
        const response = await fetchWithFallback(url);

        if (response.ok) {
            try {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const text = await response.text();
                    if (text && text.trim()) {
                        const data = JSON.parse(text);
                        return NextResponse.json(data);
                    }
                }

                // If no content or not JSON, return success
                return NextResponse.json({ success: true, status: response.status });
            } catch (parseError) {
                console.error(`Error parsing JSON response: ${parseError}`);
                return NextResponse.json({ success: true, status: response.status });
            }
        } else {
            const errorText = await response.text();
            console.error(`API returned error status ${response.status}: ${errorText}`);
            return NextResponse.json(
                { error: `API returned status ${response.status}`, details: errorText },
                { status: response.status }
            );
        }
    } catch (error) {
        console.error(`Error proxying GET request to ${url}:`, error);
        return NextResponse.json({ error: 'Failed to fetch data from API' }, { status: 500 });
    }
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
    const path = params.path.join('/');
    const url = `${API_BASE_URL}/${path}`;

    try {
        // Special case for currency initialization - may not need a request body
        const isCurrencyInit = path.includes('currency/init');

        let requestBody = {};
        let response;

        if (isCurrencyInit) {
            console.log('Special handling for currency init endpoint:', url);
            // For currency init, we don't need to send a body
            response = await fetchWithFallback(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
        } else {
            // Normal POST request with body
            try {
                requestBody = await request.json();
            } catch (error) {
                console.log('No JSON body provided or invalid JSON: ', error);
            }

            console.log('Sending POST request to:', url);
            console.log('Request body:', requestBody);

            response = await fetchWithFallback(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });
        }

        console.log('Response status:', response.status);

        if (response.ok) {
            try {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const text = await response.text();
                    if (text && text.trim()) {
                        const data = JSON.parse(text);
                        return NextResponse.json(data);
                    }
                }

                // If no content or not JSON, return success with gold default for currency init
                if (isCurrencyInit) {
                    return NextResponse.json({ gold: 10, success: true, status: response.status });
                } else {
                    return NextResponse.json({ success: true, status: response.status });
                }
            } catch (parseError) {
                console.error(`Error parsing JSON response: ${parseError}`);
                return NextResponse.json({ success: true, status: response.status });
            }
        } else {
            const errorText = await response.text();
            console.error(`API returned error status ${response.status}: ${errorText}`);
            return NextResponse.json(
                { error: `API returned status ${response.status}`, details: errorText },
                { status: response.status }
            );
        }
    } catch (error) {
        console.error(`Error proxying POST request to ${url}:`, error);
        return NextResponse.json({ error: 'Failed to fetch data from API' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
    const path = params.path.join('/');
    const url = `${API_BASE_URL}/${path}`;

    try {
        let requestBody = {};
        try {
            requestBody = await request.json();
        } catch (error) {
            console.log('No JSON body provided or invalid JSON: ', error);
        }

        console.log('Sending PUT request to:', url);
        console.log('Request body:', requestBody);

        const response = await fetchWithFallback(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (response.ok) {
            try {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const text = await response.text();
                    if (text && text.trim()) {
                        const data = JSON.parse(text);
                        return NextResponse.json(data);
                    }
                }
                return NextResponse.json({ success: true, status: response.status });
            } catch (parseError) {
                console.error(`Error parsing JSON response: ${parseError}`);
                return NextResponse.json({ success: true, status: response.status });
            }
        } else {
            const errorText = await response.text();
            console.error(`API returned error status ${response.status}: ${errorText}`);
            return NextResponse.json(
                { error: `API returned status ${response.status}`, details: errorText },
                { status: response.status }
            );
        }
    } catch (error) {
        console.error(`Error proxying PUT request to ${url}:`, error);
        return NextResponse.json({ error: 'Failed to fetch data from API' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
    const path = params.path.join('/');
    const url = `${API_BASE_URL}/${path}`;

    try {
        const response = await fetchWithFallback(url, {
            method: 'DELETE',
        });

        if (response.ok) {
            return NextResponse.json({ success: true, status: response.status });
        } else {
            const errorText = await response.text();
            console.error(`API returned error status ${response.status}: ${errorText}`);
            return NextResponse.json(
                { error: `API returned status ${response.status}`, details: errorText },
                { status: response.status }
            );
        }
    } catch (error) {
        console.error(`Error proxying DELETE request to ${url}:`, error);
        return NextResponse.json({ error: 'Failed to fetch data from API' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: { params: { path: string[] } }) {
    const path = params.path.join('/');
    const url = `${API_BASE_URL}/${path}`;

    try {
        let requestBody = {};
        try {
            requestBody = await request.json();
        } catch (error) {
            console.log('No JSON body provided or invalid JSON: ', error);
        }

        console.log('Sending PATCH request to:', url);
        console.log('Request body:', requestBody);

        const response = await fetchWithFallback(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (response.ok) {
            try {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const text = await response.text();
                    if (text && text.trim()) {
                        const data = JSON.parse(text);
                        return NextResponse.json(data);
                    }
                }
                return NextResponse.json({ success: true, status: response.status });
            } catch (parseError) {
                console.error(`Error parsing JSON response: ${parseError}`);
                return NextResponse.json({ success: true, status: response.status });
            }
        } else {
            const errorText = await response.text();
            console.error(`API returned error status ${response.status}: ${errorText}`);
            return NextResponse.json(
                { error: `API returned status ${response.status}`, details: errorText },
                { status: response.status }
            );
        }
    } catch (error) {
        console.error(`Error proxying PATCH request to ${url}:`, error);
        return NextResponse.json({ error: 'Failed to fetch data from API' }, { status: 500 });
    }
} 
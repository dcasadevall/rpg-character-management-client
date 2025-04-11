import { NextRequest, NextResponse } from 'next/server';

// const API_BASE_URL = 'http://localhost:5266/api/v1';
const API_BASE_URL = 'https://api.dcasadevall.com/api/v1';

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
    const path = params.path.join('/');
    const url = `${API_BASE_URL}/${path}${request.nextUrl.search}`;

    try {
        const response = await fetch(url);

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
            response = await fetch(url, {
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

            response = await fetch(url, {
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
                // For currency init, return a default gold value
                if (isCurrencyInit) {
                    return NextResponse.json({ gold: 10, success: true, status: response.status });
                } else {
                    return NextResponse.json({ success: true, status: response.status });
                }
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
        return NextResponse.json({ error: 'Failed to send data to API' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
    const path = params.path.join('/');
    const url = `${API_BASE_URL}/${path}`;

    try {
        const body = await request.json();
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        // Check if the response is successful regardless of content
        if (response.ok) {
            try {
                // Try to parse JSON if available
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const text = await response.text();
                    // Only try to parse if there's actual content
                    if (text && text.trim()) {
                        const data = JSON.parse(text);
                        return NextResponse.json(data);
                    }
                }

                // If no content or not JSON, return a success message
                return NextResponse.json({ success: true, status: response.status });
            } catch (parseError) {
                console.error(`Error parsing JSON response: ${parseError}`);
                // Still return success if the request was successful
                return NextResponse.json({ success: true, status: response.status });
            }
        } else {
            // Handle error response
            const errorText = await response.text();
            console.error(`API returned error status ${response.status}: ${errorText}`);
            return NextResponse.json(
                { error: `API returned status ${response.status}`, details: errorText },
                { status: response.status }
            );
        }
    } catch (error) {
        console.error(`Error proxying PUT request to ${url}:`, error);
        return NextResponse.json({ error: 'Failed to update data in API' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
    const path = params.path.join('/');
    const url = `${API_BASE_URL}/${path}`;

    try {
        const response = await fetch(url, {
            method: 'DELETE',
        });

        if (response.ok) {
            // For 204 No Content or similar responses, just return success
            if (response.status === 204 || !response.headers.get('content-type')) {
                return NextResponse.json({ success: true, status: response.status });
            }

            // Try to parse JSON if it exists
            try {
                if (response.headers.get('content-type')?.includes('application/json')) {
                    const text = await response.text();
                    if (text && text.trim()) {
                        const data = JSON.parse(text);
                        return NextResponse.json(data);
                    }
                }

                // Default success response
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
        console.error(`Error proxying DELETE request to ${url}:`, error);
        return NextResponse.json({ error: 'Failed to delete data from API' }, { status: 500 });
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
        console.log('Request headers:', request.headers);

        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

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
        return NextResponse.json({ error: 'Failed to update data in API' }, { status: 500 });
    }
} 
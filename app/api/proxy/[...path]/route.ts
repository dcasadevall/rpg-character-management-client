import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'http://localhost:5266/api/v1';

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
    const path = params.path.join('/');
    const url = `${API_BASE_URL}/${path}${request.nextUrl.search}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error(`Error proxying GET request to ${url}:`, error);
        return NextResponse.json({ error: 'Failed to fetch data from API' }, { status: 500 });
    }
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
    const path = params.path.join('/');
    const url = `${API_BASE_URL}/${path}`;

    try {
        const body = await request.json();
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        console.log(data);
        return NextResponse.json(data);
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

        const data = await response.json();
        return NextResponse.json(data);
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

        if (response.status === 204) {
            return new NextResponse(null, { status: 204 });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error(`Error proxying DELETE request to ${url}:`, error);
        return NextResponse.json({ error: 'Failed to delete data from API' }, { status: 500 });
    }
} 
import { NextRequest, NextResponse } from 'next/server';
import { HOST } from '@/app/constants/api';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || '';
    const category = searchParams.get('category') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';

    // Chuyển tiếp request tới API chính nếu bạn có một backend riêng
    const apiUrl = new URL('/products', HOST);
    
    // Thêm các tham số tìm kiếm
    if (query) apiUrl.searchParams.append('search', query);
    if (category) apiUrl.searchParams.append('category', category);
    if (minPrice) apiUrl.searchParams.append('minPrice', minPrice);
    if (maxPrice) apiUrl.searchParams.append('maxPrice', maxPrice);

    const response = await fetch(apiUrl.toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Search products API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
import { OpenAI } from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { HOST } from '@/app/constants/api';

const openai = new OpenAI({
   apiKey: process.env.OPENAI_API_KEY,
});

// Định nghĩa các kiểu dữ liệu
interface ProductImage {
   id: string;
   path: string;
   public_id: string;
   entity: string;
}

interface ProductDetail {
   id: number;
   size: string;
   type: string;
   isActive: boolean;
   quantities: number;
   values: string;
   rating: number;
   images?: ProductImage[];
   entity: string;
   productId?: number; // ID của sản phẩm cha
}

interface Price {
   id: number;
   base_price: string;
   discount_price: string;
   start_date: string;
   end_date: string;
   product_detail: ProductDetail;
   __entity: string;
}

interface Product {
   id: number;
   name: string;
   description: string;
   category_id: number;
   images: ProductImage[];
   entity: string;
   details?: ProductDetail[]; // Chi tiết sản phẩm có thể được trả về từ API chi tiết
}

export async function POST(req: NextRequest) {
   try {
      const body = await req.json();
      const { message } = body;

      // Thêm tìm kiếm theo rating trong phần phân tích intent
      const intentAnalysis = await openai.chat.completions.create({
         model: 'gpt-4o',
         messages: [
            {
               role: 'system',
               content: `Bạn là trợ lý phân tích ý định tìm kiếm sản phẩm nến thơm CandleBliss. Phân tích yêu cầu của khách hàng và trích xuất các thông số quan trọng.

NHIỆM VỤ:
- Phân tích tin nhắn để xác định xem người dùng có đang tìm kiếm sản phẩm không
- Trích xuất chính xác từ khóa tìm kiếm và các bộ lọc
- Xác định đúng mùi hương, kích thước, loại nến, mục đích sử dụng, đánh giá

DANH SÁCH MÙI HƯƠNG CÓ SẴN:
1. Hương Hoa: Lavender Thyme, Gardenia, Sunshine rose, Tuberose, Lily Valey, Freesia, Mộc lan
2. Hương Trái Cây: Citrus, Cam Bergamot, Hương dâu, Hương bưởi, Dưa hấu, Apple Strudel, Fruit Temptation
3. Hương Gỗ: Warm Wood, Cedar Wood, Sandalwood, Pine Forest, Gỗ Trầm, Ebony aloes, Midnight Suede
4. Hương Trà: Zen Tea, Prosperity Tea, Tea White, Zen & Tea
5. Hương Đặc Biệt: Sound of Nature, Gold Leaf, Silver Foil, Bright Love, First Encounter, Day, Night, Vanilla, Socola, Fresh Spring

KIẾN THỨC:
- Danh mục sản phẩm hiện có: Nến thơm, Tinh dầu, Phụ kiện, Nước hoa
- Kích thước thông dụng: S (nhỏ), M (vừa), L (lớn), hoặc theo gram: 100-200g (nhỏ), 200-400g (vừa), 400g+ (lớn)
- Đánh giá: Từ 1-5 sao
- Số bấc: 1 bấc, 2 bấc, 3 bấc

OUTPUT:
Nếu khách hàng đang tìm kiếm sản phẩm, trả về JSON:
{
  "intent": "search_product",
  "query": "<từ khóa tìm kiếm chính - KHÔNG BAO GIỜ để trống>",
  "filters": {
    "category": "<thể loại nến nếu được đề cập - ưu tiên các danh mục hiện có: Nến thơm, Tinh dầu, Phụ kiện, Nước hoa>",
    "priceRange": { 
      "min": <giá tối thiểu nếu đề cập>, 
      "max": <giá tối đa nếu đề cập> 
    },
    "size": "<kích thước>",
    "scent": "<mùi hương - sử dụng chính xác tên mùi hương từ danh sách có sẵn>",
    "type": "<loại biến thể khác>",
    "feature": "<đặc điểm nổi bật>",
    "minRating": <đánh giá tối thiểu, từ 1-5, nếu người dùng tìm kiếm sản phẩm được đánh giá cao>
  }
}

Nếu không phải tìm kiếm: { "intent": "chat" }

LƯU Ý:
1. Luôn đảm bảo trường "query" chứa từ khóa tìm kiếm chính - đây là từ khóa QUAN TRỌNG NHẤT để tìm kiếm
2. Khi người dùng nêu rõ danh mục sản phẩm, hãy giữ nguyên tên danh mục đó trong trường "category" (ví dụ: "Nến thơm", "Tinh dầu", "Phụ kiện"...)
3. Khi người dùng nhắc đến mùi hương, hãy sử dụng chính xác tên mùi hương trong danh sách có sẵn
4. Xử lý các trường hợp tìm kiếm như:
   - "Tôi muốn tìm nến hương oải hương" -> scent: "Lavender Thyme"
   - "Có nến mùi gỗ không" -> scent: "Warm Wood" hoặc một trong các mùi gỗ khác
   - "Tôi thích mùi cam" -> scent: "Citrus" hoặc "Hương cam"
5. Chuyển đổi mô tả giá thành số (VD: "dưới 100 nghìn" → "max": 100000)`,
            },
            { role: 'user', content: message },
         ],
         response_format: { type: 'json_object' },
         temperature: 0.3,
      });

      const intentResult = JSON.parse(
         intentAnalysis.choices[0].message.content || '{"intent": "chat"}',
      );

      // Nếu ý định là tìm kiếm sản phẩm
      if (intentResult.intent === 'search_product') {
         // Đầu tiên lấy danh sách categories để có thể mapping tên danh mục
         const categoriesResponse = await fetch(`${HOST}/api/categories`, {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
            },
            cache: 'no-store',
         });

         // Danh sách categories để mapping
         let categories: { id: number; name: string; description: string }[] = [];
         if (categoriesResponse.ok) {
            categories = await categoriesResponse.json();
         }

         // Tạo mapping từ tên danh mục sang id
         const categoryNameToIdMap = new Map();
         categories.forEach((cat) => {
            categoryNameToIdMap.set(cat.name.toLowerCase(), cat.id);
         });

         // Tìm kiếm sản phẩm thông qua API
         const searchParams = new URLSearchParams();
         searchParams.append('query', intentResult.query);

         if (intentResult.filters?.category) {
            searchParams.append('category', intentResult.filters.category);
         }

         if (intentResult.filters?.priceRange?.min) {
            searchParams.append('minPrice', intentResult.filters.priceRange.min);
         }

         if (intentResult.filters?.priceRange?.max) {
            searchParams.append('maxPrice', intentResult.filters.priceRange.max);
         }

         if (intentResult.filters?.size) {
            searchParams.append('size', intentResult.filters.size);
         }

         if (intentResult.filters?.scent) {
            searchParams.append('scent', intentResult.filters.scent);
         }

         if (intentResult.filters?.type) {
            searchParams.append('type', intentResult.filters.type);
         }

         if (intentResult.filters?.feature) {
            searchParams.append('feature', intentResult.filters.feature);
         }

         // Thay vì gọi API search không tồn tại
         const productsResponse = await fetch(`${HOST}/api/products`, {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
            },
            cache: 'no-store',
         });

         let products: Product[] = await productsResponse.json();

         // Cải thiện tìm kiếm theo tên sản phẩm
         if (intentResult.query) {
            const query = intentResult.query.toLowerCase();

            // Tách thành các từ khóa riêng biệt để tìm kiếm
            const keywords = query
               .split(/\s+/)
               .filter((word: string) => word.length > 2) // Chỉ lấy từ có nghĩa (dài hơn 2 ký tự)
               .map((word: string) => word.normalize('NFD').replace(/[\u0300-\u036f]/g, '')) // Bỏ dấu tiếng Việt
               .filter(Boolean);

            // Hàm bỏ dấu tiếng Việt để tìm kiếm tốt hơn
            const removeAccents = (str: string) =>
               str
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .toLowerCase();

            products = products.filter((product) => {
               if (!product.name && !product.description) return false;

               // Chuẩn hóa nội dung để tìm kiếm
               const normalizedName = removeAccents(product.name || '');
               const normalizedDesc = removeAccents(product.description || '');

               // Tính điểm phù hợp cho mỗi sản phẩm
               let matchScore = 0;

               // Kiểm tra từng từ khóa
               for (const keyword of keywords) {
                  // Tìm trong tên (ưu tiên cao hơn)
                  if (normalizedName.includes(keyword)) {
                     matchScore += 3;
                  }
                  // Tìm trong mô tả
                  if (normalizedDesc.includes(keyword)) {
                     matchScore += 1;
                  }
               }

               // Kiểm tra cụm từ hoàn chỉnh
               const normalizedQuery = removeAccents(query);
               if (normalizedName.includes(normalizedQuery)) {
                  matchScore += 5;
               }
               if (normalizedDesc.includes(normalizedQuery)) {
                  matchScore += 2;
               }

               return matchScore > 0;
            });

            // Sắp xếp theo độ phù hợp
            products = products.sort((a, b) => {
               const scoreA = calculateMatchScore(a, query);
               const scoreB = calculateMatchScore(b, query);
               return scoreB - scoreA;
            });

            // Cập nhật hàm tính điểm phù hợp
            function calculateMatchScore(product: Product, query: string): number {
               // Tương tự như logic trong filter
               const normalizedName = removeAccents(product.name || '');
               const normalizedDesc = removeAccents(product.description || '');
               const normalizedQuery = removeAccents(query);

               let score = 0;

               // Từng từ khóa
               for (const keyword of keywords) {
                  if (normalizedName.includes(keyword)) score += 3;
                  if (normalizedDesc.includes(keyword)) score += 1;
               }

               // Cụm từ hoàn chỉnh
               if (normalizedName.includes(normalizedQuery)) score += 5;
               if (normalizedDesc.includes(normalizedQuery)) score += 2;

               return score;
            }
         }

         // Sửa lại phần lọc theo danh mục để sử dụng danh sách categories từ API
         if (intentResult.filters?.category) {
            const categoryFilter = intentResult.filters.category.toLowerCase();

            // Kiểm tra khớp chính xác trước
            const matchedCategoryIds: number[] = [];

            // Tìm khớp trực tiếp với tên danh mục từ API
            for (const category of categories) {
               if (
                  category.name.toLowerCase() === categoryFilter ||
                  category.name.toLowerCase().includes(categoryFilter) ||
                  categoryFilter.includes(category.name.toLowerCase())
               ) {
                  matchedCategoryIds.push(category.id);
               }
            }

            // Nếu không tìm thấy, sử dụng mapping từ điển cứng
            if (matchedCategoryIds.length === 0) {
               // Mapping các từ khóa danh mục phổ biến với category_id
               const categoryMappings = {
                  'nến thơm': [4],
                  nến: [4],
                  thơm: [4],
                  'tinh dầu': [5],
                  'dầu thơm': [5],
                  'phụ kiện': [6],
                  'phụ kiện nến': [6],
                  'nước hoa': [7],
               };

               // Tìm các category ID phù hợp từ mapping
               for (const [key, ids] of Object.entries(categoryMappings)) {
                  if (key.includes(categoryFilter) || categoryFilter.includes(key)) {
                     matchedCategoryIds.push(...ids);
                  }
               }
            }

            // Nếu vẫn không tìm thấy, thử fuzzy matching với tên categories
            if (matchedCategoryIds.length === 0) {
               for (const category of categories) {
                  // Tách từng từ trong tên danh mục và tìm kiếm
                  const words = category.name.toLowerCase().split(/\s+/);
                  for (const word of words) {
                     if (
                        word.length > 2 &&
                        (categoryFilter.includes(word) || word.includes(categoryFilter))
                     ) {
                        matchedCategoryIds.push(category.id);
                        break;
                     }
                  }
               }
            }

            // Lọc theo các category ID đã xác định
            if (matchedCategoryIds.length > 0) {
               const uniqueCategoryIds = [...new Set(matchedCategoryIds)];
               products = products.filter((product) =>
                  uniqueCategoryIds.includes(product.category_id),
               );
            }
         }

         // Cải thiện lọc theo giá
         if (intentResult.filters?.priceRange?.min || intentResult.filters?.priceRange?.max) {
            // Tạo mảng để lưu id của các sản phẩm phù hợp với bộ lọc giá
            const priceFilteredProductIds = new Set<number>();

            try {
               // Gọi API để lấy tất cả giá
               const allPricesResponse = await fetch(`${HOST}/api/v1/prices`, {
                  method: 'GET',
                  headers: {
                     'Content-Type': 'application/json',
                  },
                  cache: 'no-store',
               });

               if (allPricesResponse.ok) {
                  const allPrices: Price[] = await allPricesResponse.json();

                  // Lọc giá theo khoảng giá yêu cầu
                  for (const price of allPrices) {
                     if (!price.product_detail) continue;

                     const basePrice = parseInt(price.base_price);
                     const discountPrice =
                        price.discount_price && price.discount_price !== '0'
                           ? parseInt(price.discount_price)
                           : 0;

                     // Tính giá cuối cùng dựa trên discount_price (giả sử là phần trăm)
                     const finalPrice =
                        discountPrice > 0
                           ? Math.round(basePrice * (1 - discountPrice / 100))
                           : basePrice;

                     // Kiểm tra xem giá có nằm trong khoảng yêu cầu không
                     const withinRange =
                        (!intentResult.filters.priceRange.min ||
                           finalPrice >= intentResult.filters.priceRange.min) &&
                        (!intentResult.filters.priceRange.max ||
                           finalPrice <= intentResult.filters.priceRange.max);

                     // Lưu ID sản phẩm (không phải ID chi tiết)
                     if (withinRange && price.product_detail.productId) {
                        priceFilteredProductIds.add(price.product_detail.productId);
                     }
                  }

                  // Chỉ lọc nếu có kết quả, tránh lọc hết sản phẩm khi không tìm thấy giá phù hợp
                  if (priceFilteredProductIds.size > 0) {
                     console.log(
                        `Found ${priceFilteredProductIds.size} products matching price range`,
                     );
                     products = products.filter((product) =>
                        priceFilteredProductIds.has(product.id),
                     );
                  } else {
                     console.log('No products match the price range filter');
                  }
               }
            } catch (error) {
               console.error('Error filtering by price:', error);
            }
         }

         // Thêm đoạn mã để áp dụng tìm kiếm theo rating nếu có

         // Lấy dữ liệu rating cho tất cả sản phẩm nếu cần lọc theo rating
         if (intentResult.filters?.minRating && intentResult.filters.minRating > 0) {
            try {
               // Tạo mảng để lưu ID của các sản phẩm có rating đủ cao
               const ratingFilteredProductIds = new Set<number>();

               // Lấy tất cả đánh giá sản phẩm
               for (const product of products) {
                  try {
                     const ratingResponse = await fetch(`${HOST}/api/rating/get-by-product`, {
                        method: 'POST',
                        headers: {
                           'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ product_id: product.id }),
                     });

                     if (ratingResponse.ok) {
                        const ratingsData = await ratingResponse.json();
                        if (Array.isArray(ratingsData) && ratingsData.length > 0) {
                           const totalRating = ratingsData.reduce(
                              (sum, item) => sum + (item.rating || item.avg_rating || 0),
                              0,
                           );
                           const avgRating =
                              ratingsData.length > 0 ? totalRating / ratingsData.length : 0;

                           // Nếu rating trung bình đủ cao, thêm vào danh sách lọc
                           if (avgRating >= intentResult.filters.minRating) {
                              ratingFilteredProductIds.add(product.id);
                           }
                        }
                     }
                  } catch (error) {
                     console.error(`Error getting rating for product ${product.id}:`, error);
                  }
               }

               // Chỉ lọc nếu có kết quả
               if (ratingFilteredProductIds.size > 0) {
                  products = products.filter((product) => ratingFilteredProductIds.has(product.id));
               }
            } catch (error) {
               console.error('Error filtering by rating:', error);
            }
         }

         if (products && products.length > 0) {
            // Lấy tất cả ID sản phẩm để fetch rating hàng loạt
            const productIds = products.map((product) => product.id);

            // Lấy ratings cho tất cả sản phẩm cùng lúc
            const ratingsMap = await fetchRatingsForProducts(productIds);

            const enrichedProducts = await Promise.all(
               products.slice(0, 3).map(async (product) => {
                  // 1. Lấy chi tiết sản phẩm
                  const detailResponse = await fetch(`${HOST}/api/products/${product.id}`, {
                     method: 'GET',
                     headers: {
                        'Content-Type': 'application/json',
                     },
                     cache: 'no-store',
                  });

                  const detailData = await detailResponse.json();
                  let details: ProductDetail[] = [];

                  // Xử lý dữ liệu chi tiết sản phẩm
                  if (detailData.details && detailData.details.length > 0) {
                     details = detailData.details;
                  }

                  // 2. Lấy thông tin giá
                  const pricesResponse = await fetch(`${HOST}/api/v1/prices`, {
                     method: 'GET',
                     headers: {
                        'Content-Type': 'application/json',
                        Authorization:
                           'Bearer ' +
                           (typeof localStorage !== 'undefined'
                              ? localStorage.getItem('token')
                              : ''),
                     },
                     cache: 'no-store',
                  });

                  const pricesData: Price[] = await pricesResponse.json();

                  // 3. Lọc giá cho sản phẩm hiện tại
                  // Tạo mapping giữa detail và price
                  const detailPrices: { [detailId: number]: Price } = {};

                  if (details.length > 0) {
                     const detailIds = details.map((d) => d.id);

                     pricesData.forEach((price) => {
                        if (price.product_detail && detailIds.includes(price.product_detail.id)) {
                           detailPrices[price.product_detail.id] = price;
                        }
                     });
                  }

                  // 4. Lọc chi tiết sản phẩm phù hợp với bộ lọc (nếu có)
                  let filteredDetails = [...details];

                  if (intentResult.filters?.size && filteredDetails.length > 0) {
                     filteredDetails = filteredDetails.filter((detail) =>
                        detail.size.toLowerCase().includes(intentResult.filters.size.toLowerCase()),
                     );
                  }

                  // Thay thế phần mapping mùi hương hiện tại bằng mapping đầy đủ hơn

                  // Thêm mapping từ đồng nghĩa cho mùi hương để hỗ trợ tìm kiếm chính xác
                  const scentSynonyms = {
                     // Hương hoa
                     lavender: [
                        'lavender',
                        'hoa oải hương',
                        'oải hương',
                        'hoa lavender',
                        'hương thảo',
                        'lavender thyme',
                     ],
                     gardenia: ['gardenia', 'hoa dành dành', 'dành dành', 'cây dành dành'],
                     rose: ['rose', 'hoa hồng', 'sunshine rose'],
                     freesia: [
                        'freesia',
                        'hoa lan nam phi',
                        'pear & freesia',
                        'english pear & freesia',
                        'qủa lê anh',
                     ],
                     tuberose: ['tuberose', 'hoa huệ', 'hoa huệ trắng'],
                     lily: ['lily', 'lily valey', 'hoa loa kèn', 'valley citrus'],
                     'mộc lan': ['mộc lan', 'sao mộc lan', 'magnolia'],

                     // Hương trái cây
                     citrus: [
                        'citrus',
                        'cam chanh',
                        'cam quýt',
                        'chanh',
                        'hương chanh',
                        'cam',
                        'hương cam',
                        'cam bergamot',
                        'quýt',
                        'bưởi',
                        'hương bưởi',
                        'orange os',
                        'lemon verbena',
                     ],
                     dâu: ['dâu', 'hương dâu', 'strawberry'],
                     pear: ['pear', 'lê', 'quả lê', 'quả lê anh', 'english pear'],
                     'dưa hấu': ['dưa hấu', 'watermelon', 'dưa', 'dưa gang'],
                     apple: ['apple', 'táo', 'quả táo', 'apple strudel'],
                     fruit: ['fruit', 'trái cây', 'hỗn hợp trái cây', 'fruit temptation'],

                     // Hương gỗ và trầm
                     wood: ['wood', 'gỗ', 'warm wood', 'cedar wood', 'gỗ thông', 'gỗ trầm'],
                     sandalwood: ['sandalwood', 'đàn hương', 'gỗ đàn hương'],
                     cedar: ['cedar', 'tuyết tùng', 'gỗ tuyết tùng', 'lá tuyết tùng', 'cedar wood'],
                     pine: [
                        'pine',
                        'pine forest',
                        'rừng thông',
                        'hương rừng',
                        'gỗ thông',
                        'cây thông',
                     ],
                     ebony: ['ebony', 'ebony aloes', 'gỗ mun'],
                     'trầm hương': ['trầm hương', 'trầm', 'gỗ trầm', 'agarwood', 'oud', 'gồ trầm'],

                     // Hương thơm trà
                     tea: [
                        'tea',
                        'trà',
                        'zen tea',
                        'prosperity tea',
                        'zen & tea',
                        'tea white',
                        'trà trắng',
                        'trà xanh',
                     ],

                     // Hương thơm khác
                     vanilla: [
                        'vanilla',
                        'vani',
                        'vanila',
                        'vanillin',
                        'hương vani',
                        'hương vanilla',
                     ],
                     'ocean breeze': [
                        'ocean breeze',
                        'biển',
                        'hương biển',
                        'gió biển',
                        'sea breeze',
                        'marine',
                        'fresh spring',
                     ],
                     fresh: ['fresh', 'fresh linen', 'fresh spring', 'tươi mát'],
                     night: ['night', 'đêm', 'midnight suede'],
                     day: ['day', 'ngày', 'ban ngày'],
                     socola: ['socola', 'chocolate', 'choco', 'cacao'],
                     tomato: ['tomato', 'garden tomato', 'cà chua'],
                     warm: ['warm', 'warm welcome', 'ấm áp'],
                     'gold leaf': ['gold leaf', 'lá vàng'],
                     'silver foil': ['silver foil', 'lá bạc'],
                     'bright love': ['bright love', 'tình yêu'],
                     'sound of nature': ['sound of nature', 'âm thanh thiên nhiên'],
                     'first encounter': ['first encounter', 'lần gặp đầu tiên'],
                     'tresor in love': ['tresor in love', 'kho báu tình yêu'],
                     'lazy holiday': ['lazy holiday', 'kỳ nghỉ lười biếng'],
                     'summer laurel': ['summer laurel', 'nguyệt quế mùa hè'],
                  };

                  // Sử dụng synonym mapping trong phần lọc chi tiết sản phẩm
                  if (
                     intentResult.filters?.scent &&
                     filteredDetails.some((d) => d.type === 'Mùi hương')
                  ) {
                     const requestedScent = intentResult.filters.scent.toLowerCase();

                     // Xác định các từ đồng nghĩa có thể áp dụng
                     const scentKeywords = [requestedScent];
                     let matchedMainScent = null;

                     // Tìm từ khóa chính dựa trên từ khóa người dùng nhập vào
                     for (const [mainScent, synonyms] of Object.entries(scentSynonyms)) {
                        if (
                           synonyms.some(
                              (s) =>
                                 requestedScent.includes(s) ||
                                 s.includes(requestedScent) ||
                                 levenshteinDistance(requestedScent, s) <= 2, // Cho phép sai lệch nhỏ trong cách đánh vần
                           )
                        ) {
                           matchedMainScent = mainScent;
                           scentKeywords.push(mainScent);
                           scentKeywords.push(...synonyms);
                           break;
                        }
                     }

                     // Nếu không tìm thấy match chính xác, thử tìm match một phần
                     if (!matchedMainScent) {
                        for (const [mainScent, synonyms] of Object.entries(scentSynonyms)) {
                           for (const synonym of synonyms) {
                              const words = synonym.split(/\s+/);
                              for (const word of words) {
                                 if (
                                    word.length > 2 &&
                                    (requestedScent.includes(word) || word.includes(requestedScent))
                                 ) {
                                    matchedMainScent = mainScent;
                                    scentKeywords.push(mainScent);
                                    scentKeywords.push(...synonyms);
                                    break;
                                 }
                              }
                              if (matchedMainScent) break;
                           }
                           if (matchedMainScent) break;
                        }
                     }

                     // Lọc theo các từ đồng nghĩa đã xác định
                     filteredDetails = filteredDetails.filter(
                        (detail) =>
                           detail.type === 'Mùi hương' &&
                           scentKeywords.some(
                              (scent) =>
                                 detail.values.toLowerCase().includes(scent.toLowerCase()) ||
                                 scent.includes(detail.values.toLowerCase()) ||
                                 // Kiểm tra phần từng từ trong values
                                 detail.values
                                    .toLowerCase()
                                    .split(/\s+/)
                                    .some((word) =>
                                       scentKeywords.some(
                                          (k) => k.includes(word) || word.includes(k),
                                       ),
                                    ),
                           ),
                     );
                  }

                  // Hàm tính khoảng cách Levenshtein để cho phép tìm kiếm gần đúng
                  function levenshteinDistance(a: string, b: string): number {
                     if (a.length === 0) return b.length;
                     if (b.length === 0) return a.length;

                     const matrix = Array(a.length + 1)
                        .fill(null)
                        .map(() => Array(b.length + 1).fill(null));

                     for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
                     for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

                     for (let i = 1; i <= a.length; i++) {
                        for (let j = 1; j <= b.length; j++) {
                           const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                           matrix[i][j] = Math.min(
                              matrix[i - 1][j] + 1, // xóa
                              matrix[i][j - 1] + 1, // chèn
                              matrix[i - 1][j - 1] + cost, // thay thế
                           );
                        }
                     }

                     return matrix[a.length][b.length];
                  }

                  // 5. Nếu không tìm thấy chi tiết phù hợp với bộ lọc, sử dụng chi tiết đầu tiên
                  const detailToUse =
                     filteredDetails.length > 0
                        ? filteredDetails[0]
                        : details.length > 0
                        ? details[0]
                        : null;

                  // Sửa đoạn code xử lý giá khi discount_price là phần trăm giảm giá
                  let priceInfo: {
                     base_price: number;
                     discount_percent: number;
                     final_price: number;
                  } | null = null;

                  if (detailToUse && detailPrices[detailToUse.id]) {
                     const price = detailPrices[detailToUse.id];
                     const basePrice = parseInt(price.base_price);
                     const discountPercent =
                        price.discount_price && price.discount_price !== '0'
                           ? parseInt(price.discount_price)
                           : 0;

                     // Tính giá sau giảm giá (nếu có giảm giá)
                     const finalPrice =
                        discountPercent > 0
                           ? Math.round(basePrice * (1 - discountPercent / 100))
                           : basePrice;

                     priceInfo = {
                        base_price: basePrice,
                        discount_percent: discountPercent,
                        final_price: finalPrice,
                     };
                  }

                  // 7. Lấy đánh giá sản phẩm theo cách trang products đang làm
                  // Sử dụng rating từ ratingsMap thay vì gọi API riêng
                  const rating = ratingsMap[product.id] || 0;

                  // Trả về product với rating luôn là số
                  return {
                     ...product,
                     detail: detailToUse,
                     price: priceInfo,
                     rating: rating, // Luôn là số, mặc định là 0 nếu không có đánh giá
                     hasRating: rating > 0, // true nếu có đánh giá thực sự
                  };
               }),
            );

            // Khởi tạo categoryMap TRƯỚC khi sử dụng
            const categoryMap = new Map(categories.map((cat) => [cat.id, cat.name]));

            // Bổ sung hiển thị rating trong kết quả - xử lý cả trường hợp null
            const productDescriptions = enrichedProducts
               .map((product, idx) => {
                  // Lấy tên danh mục nếu có
                  const categoryName = categoryMap.get(product.category_id) || '';

                  // Format giá
                  const priceDisplay = product.price
                     ? product.price.discount_percent > 0
                        ? `${product.price.final_price.toLocaleString('vi-VN')}đ (Giảm ${
                             product.price.discount_percent
                          }%)`
                        : `${product.price.base_price.toLocaleString('vi-VN')}đ`
                     : 'Liên hệ để biết giá';

                  // Format rating - hiển thị dạng sao như trang products
                  const ratingDisplay = renderStarRating(product.rating);

                  // Thêm thông tin nổi bật về sản phẩm
                  const highlights = [];

                  // Thêm danh mục vào highlights
                  if (categoryName) {
                     highlights.push(`Danh mục: ${categoryName}`);
                  }

                  if (product.detail) {
                     if (product.detail.type === 'Mùi hương') {
                        highlights.push(`Mùi hương: ${product.detail.values}`);
                     }
                     if (product.detail.size) {
                        highlights.push(`Kích thước: ${product.detail.size}`);
                     }
                  }

                  // Luôn thêm rating vào highlights - hiển thị khác nhau khi có/không có đánh giá
                  if (product.rating > 0) {
                     highlights.push(`Đánh giá: ${ratingDisplay} (${product.rating.toFixed(1)})`);
                  } else {
                     highlights.push(`Đánh giá: Chưa có đánh giá`);
                  }

                  const highlightText =
                     highlights.length > 0 ? `\n   ${highlights.join(' | ')}` : '';

                  return `${idx + 1}. **${
                     product.name
                  }** - ${priceDisplay}${highlightText}\n   ${product.description
                     .substring(0, 80)
                     .replace(/\r\n/g, ' ')}...`;
               })
               .join('\n\n');

            // Thêm thông tin phù hợp với từ khóa tìm kiếm
            let searchContext = '';
            if (intentResult.query) {
               searchContext = `\n\nĐây là các sản phẩm phù hợp với từ khóa "${intentResult.query}"`;
            }

            // Thêm gợi ý liên quan
            let relatedSuggestion = '';
            if (enrichedProducts.length > 0) {
               // Phân tích sản phẩm để tạo gợi ý liên quan
               const commonCategory = determineCommonCategory(enrichedProducts);
               const commonScent = determineCommonScent(enrichedProducts);

               if (commonCategory !== null) {
                  relatedSuggestion += `\n\nBạn có thể quan tâm đến các sản phẩm khác trong danh mục ${commonCategory}.`;
               }

               if (commonScent !== null) {
                  relatedSuggestion += `\n\nNếu bạn thích mùi hương ${commonScent}, chúng tôi cũng có các sản phẩm khác với mùi hương này.`;
               }
            }
            // Bổ sung thông tin tìm kiếm trong response
            return NextResponse.json({
               result: `Tôi đã tìm thấy ${enrichedProducts.length} sản phẩm phù hợp với yêu cầu của bạn:${searchContext}\n\n${productDescriptions}${relatedSuggestion}\n\nBạn có thể xem chi tiết sản phẩm bằng cách nhấn vào liên kết bên dưới. Bạn cần tôi giúp gì thêm không?`,
               products: enrichedProducts.map((product) => ({
                  id: product.id,
                  name: product.name,
                  detail_id: product.detail?.id,
                  price: product.price ? product.price.final_price : null,
                  discount_percent: product.price?.discount_percent || 0,
                  original_price: product.price?.base_price,
                  category: categoryMap.get(product.category_id) || 'Không xác định',
                  category_id: product.category_id,
                  rating: product.rating, // Luôn là số, mặc định là 0 nếu không có đánh giá
                  hasRating: product.rating > 0, // true nếu có đánh giá thực sự
                  variant: product.detail
                     ? `${product.detail.type}: ${product.detail.values}${
                          product.detail.size ? ', ' + product.detail.size : ''
                       }`
                     : null,
                  scent: product.detail?.type === 'Mùi hương' ? product.detail.values : null,
                  size: product.detail?.size || null,
                  description: product.description.substring(0, 60) + '...',
                  image:
                     product.detail?.images?.[0]?.path ||
                     product.images?.[0]?.path ||
                     '/images/placeholder.jpg',
                  url: `/user/products/${product.id}${
                     product.detail ? `?variant=${product.detail.id}` : ''
                  }`,
               })),
               // Thêm thông tin về bộ lọc đã áp dụng
               filters_applied: {
                  query: intentResult.query || null,
                  category: intentResult.filters?.category || null,
                  priceRange: intentResult.filters?.priceRange || null,
                  size: intentResult.filters?.size || null,
                  scent: intentResult.filters?.scent || null,
                  rating: intentResult.filters?.minRating || null,
               },
            });

            // Các hàm hỗ trợ
            function determineCommonCategory(products: Product[]): string | null {
               if (!products || products.length === 0) return null;

               // Đếm số lượng sản phẩm theo từng danh mục
               const categoryCount: Record<number, { count: number; name: string }> = {};

               products.forEach((product) => {
                  const categoryId = product.category_id;
                  const categoryName = categoryMap.get(categoryId) || null;

                  if (categoryId && categoryName) {
                     if (!categoryCount[categoryId]) {
                        categoryCount[categoryId] = { count: 0, name: categoryName };
                     }
                     categoryCount[categoryId].count += 1;
                  }
               });

               // Tìm danh mục phổ biến nhất
               let mostCommonCategory = null;
               let maxCount = 0;

               Object.values(categoryCount).forEach((category) => {
                  if (category.count > maxCount) {
                     maxCount = category.count;
                     mostCommonCategory = category.name;
                  }
               });

               return mostCommonCategory;
            }

            function determineCommonScent(products: Product[]): string | null {
               if (!products || products.length === 0) return null;
               const scentCounts: { [scent: string]: number } = {};
               let totalScentProducts = 0;
               // Đếm số lượng sản phẩm theo từng mùi hương
               products.forEach((product) => {
                  // Check if product has details array and find the scent detail
                  const scentDetail = product.details?.find(
                     (detail) => detail.type === 'Mùi hương',
                  );

                  if (scentDetail && scentDetail.values) {
                     const scent = scentDetail.values;
                     if (!scentCounts[scent]) scentCounts[scent] = 0;
                     scentCounts[scent] += 1;
                     totalScentProducts++;
                  }
               });
               if (totalScentProducts === 0) return null;
               // Tìm mùi hương phổ biến nhất
               let mostCommonScent = null;
               let maxCount = 0;
               Object.entries(scentCounts).forEach(([scent, count]) => {
                  if (count > maxCount) {
                     maxCount = count;
                     mostCommonScent = scent;
                  }
               });
               return mostCommonScent;
            }
         } else {
            // Không tìm thấy sản phẩm nào phù hợp
            let suggestionMessage =
               'Rất tiếc, tôi không tìm thấy sản phẩm nào phù hợp với yêu cầu của bạn. Bạn có thể thử lại với:';

            if (intentResult.filters?.scent) {
               suggestionMessage += '\n- Một mùi hương khác như Lavender, Vanilla, hoặc Citrus';
            }

            if (intentResult.filters?.priceRange) {
               suggestionMessage += '\n- Một khoảng giá rộng hơn';
            }

            if (intentResult.filters?.size) {
               suggestionMessage +=
                  '\n- Kích thước khác như nến nhỏ (100-200g) hoặc nến vừa (200-400g)';
            }

            suggestionMessage += '\n- Từ khóa tìm kiếm khác\n- Mô tả rõ hơn về loại nến bạn cần';

            suggestionMessage +=
               '\n\nHoặc bạn có thể truy cập trang sản phẩm của chúng tôi để xem đầy đủ danh mục. Tôi có thể giúp bạn tìm kiếm gì khác không?';

            // Trong phần xử lý không tìm thấy sản phẩm
            if (intentResult.filters?.scent) {
               // Tìm mùi hương tương tự để gợi ý
               let similarScents: string[] = [];
               const requestedScent = intentResult.filters.scent.toLowerCase();

               // Tìm trong các nhóm mùi hương
               const scentCategories = {
                  'Hương Hoa': [
                     'Lavender Thyme',
                     'Gardenia',
                     'Sunshine rose',
                     'Tuberose',
                     'Lily Valey',
                     'Freesia',
                  ],
                  'Hương Trái Cây': [
                     'Citrus',
                     'Cam Bergamot',
                     'Hương dâu',
                     'Hương bưởi',
                     'Fruit Temptation',
                  ],
                  'Hương Gỗ': [
                     'Warm Wood',
                     'Cedar Wood',
                     'Sandalwood',
                     'Pine Forest',
                     'Ebony aloes',
                  ],
                  'Hương Trà': ['Zen Tea', 'Prosperity Tea', 'Tea White', 'Zen & Tea'],
               };

               // Xác định nhóm mùi hương của người dùng
               let userScentCategory = null;
               for (const [category, scents] of Object.entries(scentCategories)) {
                  for (const scent of scents) {
                     if (
                        scent.toLowerCase().includes(requestedScent) ||
                        requestedScent.includes(scent.toLowerCase())
                     ) {
                        userScentCategory = category;
                        break;
                     }
                  }
                  if (userScentCategory) break;
               }

               // Gợi ý mùi hương cùng nhóm
               if (userScentCategory) {
                  similarScents = scentCategories[userScentCategory as keyof typeof scentCategories]
                     .filter(
                        (scent: string) =>
                           !scent.toLowerCase().includes(requestedScent) &&
                           !requestedScent.includes(scent.toLowerCase()),
                     )
                     .slice(0, 3);
               } else {
                  // Nếu không xác định được nhóm, chọn ngẫu nhiên từ các mùi phổ biến
                  const popularScents = [
                     'Lavender Thyme',
                     'Zen Tea',
                     'Citrus',
                     'Warm Wood',
                     'Gardenia',
                  ];
                  similarScents = popularScents
                     .filter(
                        (s) =>
                           !s.toLowerCase().includes(requestedScent) &&
                           !requestedScent.includes(s.toLowerCase()),
                     )
                     .slice(0, 3);
               }

               // Thêm gợi ý mùi hương vào thông báo
               if (similarScents.length > 0) {
                  suggestionMessage += `\n- Thử với mùi hương tương tự như: ${similarScents.join(
                     ', ',
                  )}`;
               } else {
                  suggestionMessage += '\n- Một mùi hương khác như Lavender, Vanilla, hoặc Citrus';
               }
            }

            if (products.length === 0) {
               // Tìm các sản phẩm tương tự
               const similarProductsResponse = await fetch(`${HOST}/api/products`, {
                  method: 'GET',
                  headers: {
                     'Content-Type': 'application/json',
                  },
                  cache: 'no-store',
               });

               const allProducts: Product[] = await similarProductsResponse.json();
               let suggestedProducts: Product[] = [];

               // Tìm kiếm với từ khóa đơn giản hơn nếu có từ khóa tìm kiếm
               if (intentResult.query) {
                  const simplifiedQuery = simplifySearchTerm(intentResult.query);
                  suggestedProducts = allProducts
                     .filter(
                        (product) =>
                           product.name.toLowerCase().includes(simplifiedQuery) ||
                           product.description.toLowerCase().includes(simplifiedQuery),
                     )
                     .slice(0, 3);
               }

               // Nếu vẫn không tìm thấy, gợi ý một số sản phẩm phổ biến
               if (suggestedProducts.length === 0) {
                  // Lấy một số sản phẩm ngẫu nhiên làm gợi ý
                  suggestedProducts = allProducts.sort(() => 0.5 - Math.random()).slice(0, 3);
               }

               const suggestedProductsText = suggestedProducts
                  .map(
                     (product, idx) =>
                        `${idx + 1}. ${product.name} - ${product.description.substring(0, 60)}...`,
                  )
                  .join('\n');

               let assistanceMessage = '';
               if (intentResult.filters?.priceRange) {
                  assistanceMessage +=
                     '\nKhoảng giá bạn đang tìm kiếm có thể không khớp với sản phẩm nào. Bạn có thể thử với khoảng giá rộng hơn.';
               }

               if (intentResult.filters?.scent) {
                  assistanceMessage += `\nMùi hương "${intentResult.filters.scent}" có thể không có trong danh mục của chúng tôi. Bạn có thể thử với các mùi hương phổ biến như Lavender, Vanilla hoặc Pine Forest.`;
               }

               return NextResponse.json({
                  result: `Rất tiếc, tôi không tìm thấy sản phẩm nào phù hợp với yêu cầu của bạn.${assistanceMessage}\n\nDưới đây là một số sản phẩm bạn có thể quan tâm:\n\n${suggestedProductsText}\n\nBạn có thể mô tả lại nhu cầu của mình hoặc thử với từ khóa khác không?`,
                  suggestedProducts: suggestedProducts.map(mapProductToResponse),
               });
            }

            // Hàm hỗ trợ đơn giản hóa từ khóa tìm kiếm
            function simplifySearchTerm(term: string): string {
               // Loại bỏ các từ phổ biến và giữ lại từ khóa chính
               const commonWords = [
                  'tôi',
                  'muốn',
                  'tìm',
                  'kiếm',
                  'một',
                  'sản',
                  'phẩm',
                  'loại',
                  'có',
                  'và',
                  'hoặc',
                  'là',
                  'với',
               ];

               return term
                  .toLowerCase()
                  .split(/\s+/)
                  .filter((word) => !commonWords.includes(word) && word.length > 2)
                  .join(' ');
            }

            // Hàm mapping sản phẩm sang định dạng response
            function mapProductToResponse(product: Product) {
               return {
                  id: product.id,
                  name: product.name,
                  description: product.description.substring(0, 60) + '...',
                  image: product.images?.[0]?.path || '/images/placeholder.jpg',
                  url: `/user/products/${product.id}`,
               };
            }

            return NextResponse.json({
               result: suggestionMessage,
            });
         }
      } else {
         // Xử lý chat thông thường
         const chatResponse = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
               {
                  role: 'system',
                  content: `Bạn là trợ lý ảo của CandleBliss, một cửa hàng nến thơm cao cấp với nhiều sản phẩm chất lượng. Hãy trả lời khách hàng một cách chuyên nghiệp, thân thiện và hữu ích.

Thông tin về cửa hàng:
- CandleBliss chuyên cung cấp các loại nến thơm cao cấp, an toàn cho sức khỏe
- Sản phẩm chính: nến thơm, nến trụ, nến tealight, bộ quà tặng, phụ kiện nến
- Các mùi hương phổ biến: Lavender, Vanilla, Citrus, Pine Forest, Ocean Breeze
- Các kích thước: nến nhỏ (100-200g), nến vừa (200-400g), nến lớn (400g+)
- Cam kết về chất lượng: 100% sáp tự nhiên, không chứa paraffin, thân thiện với môi trường
- Chính sách giao hàng: Giao hàng toàn quốc, miễn phí cho đơn hàng từ 500.000đ

Nguyên tắc trả lời:
1. Luôn giữ câu trả lời ngắn gọn, súc tích, không dài dòng
2. Nếu khách hỏi về sản phẩm cụ thể mà bạn không có thông tin chi tiết, khuyên họ xem trang sản phẩm hoặc liên hệ cửa hàng
3. Luôn thể hiện sự hiểu biết về nến thơm và lợi ích của chúng
4. Tránh đưa ra các thông tin sai lệch về giá cả, chất lượng hay thông số kỹ thuật
5. Nếu khách hàng tỏ ra khó chịu, hãy tỏ ra thấu hiểu và hướng dẫn họ liên hệ với nhân viên hỗ trợ
6. Khi gợi ý sản phẩm, nhấn mạnh vào trải nghiệm và lợi ích, không chỉ đơn thuần mô tả đặc điểm`,
               },
               { role: 'user', content: message },
            ],
         });

         return NextResponse.json({ result: chatResponse.choices[0].message.content });
      }
   } catch (error) {
      console.error('Chatbot API error:', error);
      return NextResponse.json(
         { error: 'Đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.' },
         { status: 500 },
      );
   }
}

// 1. Thêm hàm fetchRatingsForProducts tương tự trang products
const fetchRatingsForProducts = async (productIds: number[]) => {
   if (!productIds.length) return {};

   try {
      const ratingPromises = productIds.map((id) =>
         fetch(`${HOST}/api/rating/get-by-product`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ product_id: id }),
         }).then((res) => (res.ok ? res.json() : [])),
      );

      const ratingsResults = await Promise.all(ratingPromises);
      const ratingsMap: Record<number, number> = {};

      productIds.forEach((id, index) => {
         const productRatings = ratingsResults[index];

         // Đảm bảo đặt đúng giá trị 0 khi không có đánh giá
         if (Array.isArray(productRatings) && productRatings.length > 0) {
            const totalRating = productRatings.reduce(
               (sum, item) => sum + (item.rating || item.avg_rating || 0),
               0,
            );

            // Đặt giá trị rating đúng
            ratingsMap[id] = totalRating / productRatings.length;
         } else {
            // Đặt 0 cho sản phẩm không có đánh giá
            ratingsMap[id] = 0;
         }
      });

      return ratingsMap;
   } catch (error) {
      console.error('Error fetching ratings batch:', error);
      return {};
   }
};

// 2. Thêm hàm renderStarRating để hiển thị sao trong kết quả chatbot
const renderStarRating = (rating: number): string => {
   // Kiểm tra nếu rating là 0 (không có đánh giá)
   if (rating === 0) {
      return '☆☆☆☆☆'; // Hiển thị 5 ngôi sao rỗng
   }

   // Làm tròn số sao thành 0.5 gần nhất
   const roundedRating = Math.round(rating * 2) / 2;

   // Hiển thị số sao bằng emoji
   return `${'⭐'.repeat(Math.floor(roundedRating))}${
      roundedRating % 1 === 0.5 ? '✨' : ''
   }${' ☆'.repeat(Math.floor(5 - roundedRating))}`;
};

import { GraphData, PresetSelectionMap, Route, TouristLocation } from '../types';

/**
 * Dữ liệu được đồng bộ trực tiếp từ Supabase vào ngày 2026-04-07.
 * Bổ sung hệ thống tuyến đường thực tế kết nối THPT Thăng Long và các danh thắng Hà Nội.
 */

export const INITIAL_LOCATIONS: TouristLocation[] = [
  {
    id: "TL",
    label: "ThangLong",
    fullName: "THPT Thăng Long - Hà Nội",
    category: "Di sản học đường",
    description: "Điểm đến lý tưởng để trải nghiệm một trường học có bề dày thành tích học tập, là một trong những trường top đầu tại Hà Nội về chất lượng giáo dục.",
    shortIntro: "Là ngôi trường với 66 năm xây dựng và trưởng thành",
    imageUrl: "https://toliha.vn/wp-content/uploads/2024/10/truong-thpt-thang-long-ha-noi-3.jpeg",
    neighborhood: "số 44 Tạ Quang Bửu, Phường Bạch Mai, Thành phố Hà Nội, Việt Nam",
    bestFor: "Chụp ảnh, Di tích lịch sử",
    highlights: [
      "Trường trung học phổ thông top đầu Hà Nội",
      "Bề dày lịch sử hơn 66 năm truyền thống hiếu học",
      "Khuôn viên sư phạm rợp bóng cây cổ thụ giữa khu Bách Khoa"
    ],
    x: 450,
    y: 560,
    fullNameEn: "Thang Long High School",
    descriptionEn: "An ideal destination to experience a school with a distinguished academic track record, ranking among the top schools in Hanoi for educational quality.",
    shortIntroEn: "A school with a 66-year history of development and growth.",
    neighborhoodEn: "44 Ta Quang Buu, Bach Mai Ward, Hanoi City, Vietnam",
    bestForEn: "Photography, Historical site",
    highlightsEn: [
      "A top-tier institution in Hanoi for education and training",
      "Over 66 years of distinguished academic heritage",
      "Tree-lined campus nestled in Hanoi's university quarter"
    ],
    googleMapsUrl: "https://maps.app.goo.gl/MoBeGLHEXBjSg4Zc6",
    images: [
      "https://toliha.vn/wp-content/uploads/2024/10/truong-thpt-thang-long-ha-noi-3.jpeg",
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80"
    ],
    lat: 21.000852788067423,
    lng: 105.84961388207323,
    displayOrder: 0
  },
  {
    id: "BH",
    label: "Bờ Hồ Hà Nội",
    fullName: "Hồ Hoàn Kiếm",
    category: "Danh lam thắng cảnh",
    description: "Hồ Hoàn Kiếm, còn được gọi là Hồ Gươm, là một trong những biểu tượng lịch sử và văn hóa nổi tiếng nhất của thủ đô Hà Nội. Nằm giữa trung tâm thành phố, hồ gắn liền với truyền thuyết vua Lê Lợi trả gươm báu cho Rùa Vàng. Với mặt hồ xanh biếc, Tháp Rùa cổ kính, cầu Thê Húc đỏ rực dẫn vào đền Ngọc Sơn và những hàng cây xanh ven hồ, nơi đây mang vẻ đẹp hài hòa giữa thiên nhiên, kiến trúc và lịch sử. Bờ Hồ là điểm đến lý tưởng để dạo bộ, khám phá văn hóa Hà Nội, chụp ảnh và trải nghiệm không khí phố đi bộ vào dịp cuối tuần.",
    shortIntro: "Biểu tượng văn hóa và lịch sử của Hà Nội, nổi bật với Tháp Rùa, cầu Thê Húc và đền Ngọc Sơn.",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxmRXKlOcPsVTKJ1Oqp2raSsKDph4nxHC4gIlWGgc92kVh4SdisNTLvVsP&s=10",
    neighborhood: "Hàng Trống, Hoàn Kiếm, Hà Nội, Việt Nam",
    bestFor: "Tham quan, Chụp ảnh, Lịch sử, Văn hóa, Dạo bộ",
    highlights: [
      "Tháp Rùa giữa lòng Hồ Gươm",
      "Cầu Thê Húc và đền Ngọc Sơn",
      "Không gian phố đi bộ cuối tuần",
      "Di tích lịch sử và văn hóa đặc sắc của Hà Nội"
    ],
    x: 580,
    y: 380,
    fullNameEn: "Hoan Kiem Lake",
    descriptionEn: "Hoan Kiem Lake, also known as Sword Lake, is one of the most iconic historical and cultural landmarks in Hanoi, Vietnam. Located in the heart of the capital, the lake is associated with the legend of King Le Loi returning the sacred sword to the Golden Turtle. With its tranquil waters, the historic Turtle Tower, the iconic red The Huc Bridge leading to Ngoc Son Temple, and tree-lined walking paths, the lake offers a harmonious blend of nature, architecture, and history. It is an ideal destination for sightseeing, photography, cultural exploration, and experiencing Hanoi's vibrant pedestrian streets on weekends.",
    shortIntroEn: "A historic and cultural symbol of Hanoi, famous for Turtle Tower, The Huc Bridge, and Ngoc Son Temple.",
    neighborhoodEn: "Hang Trong Ward, Hoan Kiem District, Hanoi, Vietnam",
    bestForEn: "Sightseeing, Photography, History, Culture, Walking",
    highlightsEn: [
      "Turtle Tower in the middle of the lake",
      "The Huc Bridge and Ngoc Son Temple",
      "Weekend pedestrian streets",
      "A distinctive historical and cultural landmark of Hanoi"
    ],
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Hoan+Kiem+Lake+Hanoi+Vietnam",
    images: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxmRXKlOcPsVTKJ1Oqp2raSsKDph4nxHC4gIlWGgc92kVh4SdisNTLvVsP&s=10",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80"
    ],
    lat: 21.028666,
    lng: 105.852148,
    displayOrder: 1
  },
  {
    id: "CDX",
    label: "Chợ Đồng Xuân",
    fullName: "Chợ Đồng Xuân",
    category: "Mua sắm",
    description: "Chợ Đồng Xuân là một trong những khu chợ truyền thống lâu đời và nổi tiếng nhất của Hà Nội, nằm trong khu phố cổ sầm uất. Với kiến trúc mặt tiền đặc trưng và không gian buôn bán nhộn nhịp, chợ là nơi tập trung nhiều mặt hàng như quần áo, vải vóc, đồ gia dụng, đồ lưu niệm và đặc sản địa phương. Không chỉ là trung tâm giao thương quan trọng, Chợ Đồng Xuân còn phản ánh nét văn hóa kinh doanh truyền thống và nhịp sống của người dân thủ đô. Đây là điểm đến phù hợp cho du khách muốn khám phá văn hóa chợ truyền thống, tìm mua quà lưu niệm và thưởng thức các món ăn đặc trưng của Hà Nội.",
    shortIntro: "Khu chợ truyền thống nổi tiếng giữa phố cổ Hà Nội, nơi khám phá văn hóa mua bán, ẩm thực và đời sống địa phương.",
    imageUrl: "https://static.vinwonders.com/production/cho-dong-xuan-top-banner-min.jpg",
    neighborhood: "Đồng Xuân, Hoàn Kiếm, Hà Nội, Việt Nam",
    bestFor: "Mua sắm, tìm quà lưu niệm, khám phá văn hóa địa phương, thưởng thức ẩm thực, chụp ảnh.",
    highlights: [
      "Khu chợ truyền thống nổi tiếng của phố cổ Hà Nội",
      "Đa dạng hàng hóa và quà lưu niệm",
      "Ẩm thực đường phố mang đậm hương vị Hà Nội",
      "Không gian mua bán nhộn nhịp và giàu giá trị văn hóa"
    ],
    x: 570,
    y: 290,
    fullNameEn: "Dong Xuan Market",
    descriptionEn: "Dong Xuan Market is one of Hanoi's oldest and most famous traditional markets, located in the bustling Old Quarter. Featuring a distinctive facade and a lively trading atmosphere, the market offers a wide range of products, including clothing, textiles, household goods, souvenirs, and local specialties. Beyond being an important commercial center, Dong Xuan Market reflects Hanoi's traditional trading culture and everyday local life. It is an ideal destination for visitors who want to explore a traditional Vietnamese market, shop for souvenirs, and sample Hanoi's local cuisine.",
    shortIntroEn: "A famous traditional market in Hanoi's Old Quarter, offering a glimpse into local shopping culture, cuisine, and everyday life.",
    neighborhoodEn: "Dong Xuan Ward, Hoan Kiem District, Hanoi, Vietnam",
    bestForEn: "Shopping, souvenir hunting, local culture, street food, photography.",
    highlightsEn: [
      "A famous traditional market in Hanoi's Old Quarter",
      "A wide variety of goods and souvenirs",
      "Street food featuring Hanoi specialties",
      "A lively trading atmosphere rich in local culture"
    ],
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Dong+Xuan+Market+Hanoi+Vietnam",
    images: [
      "https://static.vinwonders.com/production/cho-dong-xuan-top-banner-min.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Dong_Xuan_Market%2C_Hanoi.jpg/1280px-Dong_Xuan_Market%2C_Hanoi.jpg",
      "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80"
    ],
    lat: 21.0382,
    lng: 105.8500,
    displayOrder: 2
  },
  {
    id: "CTL",
    label: "Thủ Lệ",
    fullName: "Công viên Thủ Lệ",
    category: "Công viên",
    description: "Được khánh thành vào năm 1976, Công viên Thủ Lệ là một trong những điểm vui chơi, giải trí và tham quan thiên nhiên nổi tiếng tại Hà Nội. Tọa lạc tại khu vực phường Ngọc Khánh, công viên nổi bật với không gian xanh mát, hồ nước rộng và vườn thú đa dạng các loài động vật. Đây là điểm đến quen thuộc của các gia đình, đặc biệt là trẻ em, đồng thời là nơi lý tưởng để dạo chơi, thư giãn và tìm hiểu về thế giới động vật giữa lòng Thủ đô.",
    shortIntro: "Không gian xanh kết hợp vườn thú lâu đời giữa lòng Hà Nội, là điểm vui chơi và khám phá thiên nhiên yêu thích của nhiều gia đình.",
    neighborhood: "Đường Bưởi, phường Ngọc Khánh, Hà Nội",
    bestFor: "Vui chơi gia đình, tham quan vườn thú, hoạt động ngoại khóa, chụp ảnh thiên nhiên, du khách có trẻ nhỏ.",
    highlights: [
      "Vườn thú với nhiều loài động vật phong phú",
      "Hồ Thủ Lệ và không gian cây xanh thoáng mát",
      "Các khu vui chơi dành cho trẻ em"
    ],
    x: 290,
    y: 350,
    fullNameEn: "Thu Le Park",
    descriptionEn: "Opened in 1976, Thu Le Park is one of Hanoi's well-known destinations for recreation, sightseeing, and nature exploration. Located in the Ngoc Khanh area, the park features lush greenery, a large lake, and a zoo housing a variety of animal species. It is a popular destination for families, especially children, and an ideal place to stroll, relax, and learn about wildlife in the heart of the capital.",
    shortIntroEn: "A green urban park featuring a long-established zoo in Hanoi, popular with families and nature enthusiasts.",
    neighborhoodEn: "Buoi Street, Ngoc Khanh Ward, Hanoi, Vietnam",
    bestForEn: "Family outings, zoo visits, educational field trips, nature photography, tourists with children.",
    highlightsEn: [
      "A zoo featuring a diverse range of animal species",
      "Thu Le Lake and relaxing green spaces",
      "Recreational areas for children"
    ],
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Thu+Le+Park+Hanoi",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/5/53/C%C3%B4ng_vi%C3%AAn_Th%E1%BB%A7_L%E1%BB%87.JPG",
      "https://upload.wikimedia.org/wikipedia/commons/3/37/Thu_Le_Park_%2849373405867%29.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/8/85/V%C6%B0%E1%BB%9Dn_th%C3%BA_Th%E1%BB%A7_L%E1%BB%87_bi%E1%BB%83n_hi%E1%BB%87u_%281%29.jpg"
    ],
    lat: 21.030796419998325,
    lng: 105.8035074360485,
    displayOrder: 3
  },
  {
    id: "LCT",
    label: "Lăng Bác",
    fullName: "Lăng Chủ tịch Hồ Chí Minh",
    category: "Di tích lịch sử",
    description: "Lăng Chủ tịch Hồ Chí Minh là một trong những công trình lịch sử và văn hóa quan trọng nhất của Việt Nam, tọa lạc tại Quảng trường Ba Đình, thủ đô Hà Nội. Đây là nơi gìn giữ thi hài Chủ tịch Hồ Chí Minh, vị lãnh tụ kính yêu của dân tộc Việt Nam. Công trình được khánh thành ngày 29 tháng 8 năm 1975, mang kiến trúc trang nghiêm, vững chắc, kết hợp các yếu tố kiến trúc hiện đại với bản sắc dân tộc. Phía trước lăng là Quảng trường Ba Đình rộng lớn, nơi Chủ tịch Hồ Chí Minh đọc bản Tuyên ngôn Độc lập ngày 2 tháng 9 năm 1945, khai sinh nước Việt Nam Dân chủ Cộng hòa. Khu vực xung quanh còn có Phủ Chủ tịch, nhà sàn Bác Hồ, ao cá và Bảo tàng Hồ Chí Minh, tạo thành quần thể di tích có giá trị lịch sử đặc biệt. Đây là điểm đến ý nghĩa để người dân và du khách tìm hiểu lịch sử dân tộc, tưởng nhớ công lao của Chủ tịch Hồ Chí Minh và khám phá những giá trị văn hóa của thủ đô Hà Nội.",
    shortIntro: "Di tích lịch sử đặc biệt tại Quảng trường Ba Đình, nơi an nghỉ của Chủ tịch Hồ Chí Minh và gắn liền với dấu mốc khai sinh nước Việt Nam hiện đại.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Ho_chi_minh_mausoleum.jpg",
    neighborhood: "Quảng trường Ba Đình, phường Điện Biên, Hà Nội, Việt Nam",
    bestFor: "Tham quan lịch sử, tìm hiểu văn hóa, giáo dục truyền thống, viếng Lăng Bác, chụp ảnh khu vực bên ngoài.",
    highlights: [
      "Công trình kiến trúc trang nghiêm, biểu tượng lịch sử của Việt Nam",
      "Quảng trường Ba Đình – nơi Chủ tịch Hồ Chí Minh đọc Tuyên ngôn Độc lập",
      "Nghi lễ thượng cờ và hạ cờ tại Quảng trường Ba Đình",
      "Quần thể di tích gồm Phủ Chủ tịch, nhà sàn Bác Hồ và ao cá",
      "Bảo tàng Hồ Chí Minh với nhiều tư liệu về cuộc đời và sự nghiệp của Bác"
    ],
    x: 480,
    y: 310,
    fullNameEn: "Ho Chi Minh Mausoleum",
    descriptionEn: "The Ho Chi Minh Mausoleum is one of Vietnam's most important historical and cultural landmarks, located in Ba Dinh Square in Hanoi. It preserves the embalmed body of President Ho Chi Minh, the beloved leader of the Vietnamese people. Officially inaugurated on August 29, 1975, the mausoleum features solemn and monumental architecture that combines modern design with Vietnamese national identity. In front of the mausoleum lies the spacious Ba Dinh Square, where President Ho Chi Minh proclaimed the Declaration of Independence on September 2, 1945, establishing the Democratic Republic of Vietnam. The surrounding complex also includes the Presidential Palace, Ho Chi Minh's Stilt House, the fish pond, and the Ho Chi Minh Museum. Together, these sites offer visitors an opportunity to learn about Vietnamese history, honor President Ho Chi Minh's legacy, and explore the cultural heritage of Hanoi.",
    shortIntroEn: "A major historical landmark in Ba Dinh Square, Hanoi, honoring President Ho Chi Minh and commemorating the birth of modern Vietnam.",
    neighborhoodEn: "Ba Dinh Square, Dien Bien Ward, Hanoi, Vietnam",
    bestForEn: "Historical sightseeing, cultural exploration, educational visits, paying respects to Ho Chi Minh, exterior photography.",
    highlightsEn: [
      "A solemn architectural landmark and symbol of Vietnamese history",
      "Ba Dinh Square, where the Declaration of Independence was proclaimed",
      "The flag-raising and flag-lowering ceremonies at Ba Dinh Square",
      "A historic complex featuring the Presidential Palace, Ho Chi Minh's Stilt House, and the fish pond",
      "The Ho Chi Minh Museum, showcasing materials about his life and legacy"
    ],
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Ho+Chi+Minh+Mausoleum+Ba+Dinh+Hanoi+Vietnam",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/0/0a/Ho_chi_minh_mausoleum.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/3/3d/L%C4%83ng_Ch%E1%BB%A7_t%E1%BB%8Bch_H%E1%BB%93_Ch%C3%AD_Minh.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/b/bb/Ho_chi_minh_mausoleum_2.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/f/fb/L%C4%83ng_ch%E1%BB%A7_t%E1%BB%8Bch_H%E1%BB%93_Ch%C3%AD_Minh_v%E1%BB%81_%C4%91%C3%AAm.jpg"
    ],
    lat: 21.037087541800986,
    lng: 105.83465596673248,
    displayOrder: 4
  },
  {
    id: "LOTTE",
    label: "Lotte",
    fullName: "Tòa nhà Lotte Center Hanoi",
    category: "Danh lam thắng cảnh",
    description: "Hoàn thành vào năm 2014, Lotte Center Hanoi là một trong những tòa nhà chọc trời nổi bật của Thủ đô, tọa lạc tại khu vực Liễu Giai, quận Ba Đình. Với thiết kế kiến trúc hiện đại và chiều cao ấn tượng, công trình là tổ hợp đa chức năng bao gồm trung tâm thương mại, văn phòng, khách sạn và khu căn hộ cao cấp. Đặc biệt, đài quan sát trên cao mang đến tầm nhìn toàn cảnh Hà Nội, trở thành điểm đến hấp dẫn dành cho du khách yêu thích khám phá thành phố từ trên cao.",
    shortIntro: "Tòa nhà chọc trời biểu tượng của Hà Nội với kiến trúc hiện đại, trung tâm mua sắm sầm uất và đài quan sát ngắm toàn cảnh thành phố.",
    neighborhood: "54 Liễu Giai, phường Ngọc Hà, Hà Nội",
    bestFor: "Ngắm toàn cảnh thành phố, mua sắm, chụp ảnh check-in, trải nghiệm kiến trúc hiện đại, vui chơi cùng gia đình.",
    highlights: [
      "Kiến trúc nhà chọc trời hiện đại",
      "Đài quan sát Lotte Observation Deck",
      "Trung tâm thương mại với nhiều thương hiệu nổi tiếng",
      "Tầm nhìn toàn cảnh Hà Nội từ trên cao"
    ],
    x: 340,
    y: 350,
    fullNameEn: "Lotte Center Hanoi",
    descriptionEn: "Completed in 2014, Lotte Center Hanoi is one of the capital's most prominent skyscrapers, located in the Lieu Giai area of Hanoi. Featuring striking modern architecture, the building is a multifunctional complex housing a shopping mall, offices, a hotel, and luxury residences. Its observation deck offers panoramic views of Hanoi, making it an attractive destination for visitors who want to experience the city from above.",
    shortIntroEn: "An iconic Hanoi skyscraper featuring modern architecture, a vibrant shopping mall, and an observation deck with panoramic city views.",
    neighborhoodEn: "54 Lieu Giai Street, Ngoc Ha Ward, Hanoi, Vietnam",
    bestForEn: "Panoramic city views, shopping, photography, modern architecture, family outings.",
    highlightsEn: [
      "Striking modern skyscraper architecture",
      "Lotte Observation Deck",
      "Shopping mall featuring international brands",
      "Panoramic views of Hanoi from above"
    ],
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Lotte+Center+Hanoi",
    images: [
      "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=80"
    ],
    lat: 21.0313,
    lng: 105.8127,
    displayOrder: 5
  },
  {
    id: "VMQTG",
    label: "Văn Miếu",
    fullName: "Văn Miếu – Quốc Tử Giám",
    category: "Danh lam thắng cảnh",
    description: "Được xây dựng vào năm 1070 dưới triều vua Lý Thánh Tông, Văn Miếu – Quốc Tử Giám là quần thể di tích lịch sử, văn hóa tiêu biểu của Hà Nội và được xem là trường đại học đầu tiên của Việt Nam. Nơi đây thờ Khổng Tử, các bậc hiền triết Nho học và lưu giữ những giá trị quý báu của nền giáo dục Việt Nam qua nhiều thế kỷ. Nổi bật với Khuê Văn Các, giếng Thiên Quang và hệ thống 82 bia tiến sĩ được UNESCO ghi danh là Di sản tư liệu thế giới, địa danh này là điểm đến hấp dẫn dành cho những ai muốn tìm hiểu lịch sử, văn hóa và truyền thống hiếu học của dân tộc.",
    shortIntro: "Quần thể di tích giáo dục và văn hóa lâu đời của Thủ đô, biểu tượng của truyền thống hiếu học Việt Nam với kiến trúc cổ kính và Khuê Văn Các nổi tiếng.",
    neighborhood: "58 Quốc Tử Giám, phường Văn Miếu – Quốc Tử Giám, Hà Nội, Việt Nam",
    bestFor: "Tìm hiểu lịch sử và văn hóa, tham quan kiến trúc cổ, chụp ảnh check-in, du lịch giáo dục, trải nghiệm văn hóa truyền thống.",
    highlights: [
      "Khuê Văn Các – biểu tượng văn hóa của Hà Nội",
      "82 bia tiến sĩ ghi danh các nhà khoa bảng Việt Nam",
      "Giếng Thiên Quang và khuôn viên kiến trúc truyền thống",
      "Di tích trường đại học đầu tiên của Việt Nam"
    ],
    x: 480,
    y: 390,
    fullNameEn: "Temple of Literature – Imperial Academy",
    descriptionEn: "Established in 1070 under Emperor Ly Thanh Tong, the Temple of Literature – Imperial Academy is one of Hanoi's most important historical and cultural landmarks and is widely recognized as the site of Vietnam's first national university. Dedicated to Confucius and prominent scholars, the complex preserves the country's educational heritage across centuries. Its highlights include Khue Van Pavilion, the Well of Heavenly Clarity, and 82 doctoral stelae recognized by UNESCO as Memory of the World documentary heritage. It is an ideal destination for visitors interested in Vietnamese history, traditional architecture, and the nation's long-standing respect for education.",
    shortIntroEn: "A historic cultural and educational complex in Hanoi, symbolizing Vietnam's scholarly tradition through its ancient architecture and iconic Khue Van Pavilion.",
    neighborhoodEn: "58 Quoc Tu Giam Street, Hanoi, Vietnam",
    bestForEn: "Historical and cultural exploration, traditional architecture, photography, educational tourism, cultural experiences.",
    highlightsEn: [
      "Khue Van Pavilion – an iconic symbol of Hanoi",
      "82 doctoral stelae commemorating Vietnamese scholars",
      "The Well of Heavenly Clarity and traditional architecture",
      "The site of Vietnam's first national university"
    ],
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Temple+of+Literature+Hanoi",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Constellation_of_Literature_pavilion%2C_Temple_of_Literature%2C_Hanoi%2C_Vietnam%2C_20240123_0935_3091.jpg/1280px-Constellation_of_Literature_pavilion%2C_Temple_of_Literature%2C_Hanoi%2C_Vietnam%2C_20240123_0935_3091.jpg",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Constellation_of_Literature_pavilion%2C_Temple_of_Literature%2C_Hanoi%2C_Vietnam%2C_20240123_0935_3091.jpg/1280px-Constellation_of_Literature_pavilion%2C_Temple_of_Literature%2C_Hanoi%2C_Vietnam%2C_20240123_0935_3091.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Constellation_of_Literature_pavilion_%28Temple_of_Literature%2C_Hanoi%29.jpg/1280px-Constellation_of_Literature_pavilion_%28Temple_of_Literature%2C_Hanoi%29.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/1/17/Constellation_of_Literature_pavilion%2C_Temple_of_Literature%2C_Hanoi%2C_Vietnam%2C_20240123_0931_3072.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/0/07/V%C4%83n_Mi%E1%BA%BFu_-_Qu%E1%BB%91c_T%E1%BB%AD_Gi%C3%A1m_-_Khu%C3%AA_V%C4%83n_C%C3%A1c.png"
    ],
    lat: 21.0277,
    lng: 105.8355,
    displayOrder: 6
  },
  {
    id: "HTTL",
    label: "Hoàng Thành",
    fullName: "Hoàng thành Thăng Long",
    category: "Danh lam thắng cảnh",
    description: "Hoàng thành Thăng Long là quần thể di tích lịch sử quan trọng bậc nhất của Việt Nam, gắn liền với lịch sử kinh đô Thăng Long – Hà Nội suốt hơn một nghìn năm. Được xây dựng từ thế kỷ XI dưới triều Lý, nơi đây từng là trung tâm quyền lực chính trị của nhiều triều đại phong kiến Việt Nam. Năm 2010, Hoàng thành Thăng Long được UNESCO công nhận là Di sản văn hóa thế giới nhờ những giá trị nổi bật về lịch sử, kiến trúc và khảo cổ học. Nổi bật với Đoan Môn, Điện Kính Thiên, thềm rồng đá và khu khảo cổ 18 Hoàng Diệu, địa danh này là điểm đến lý tưởng để khám phá chiều sâu lịch sử và văn hóa dân tộc.",
    shortIntro: "Di sản văn hóa thế giới giữa lòng Hà Nội, lưu giữ dấu tích kinh thành cổ và hơn một nghìn năm lịch sử các triều đại Việt Nam.",
    neighborhood: "19C Hoàng Diệu, phường Ba Đình, Hà Nội, Việt Nam",
    bestFor: "Khám phá lịch sử, tham quan di sản, tìm hiểu kiến trúc cổ, chụp ảnh check-in, du lịch văn hóa và giáo dục.",
    highlights: [
      "Di sản văn hóa thế giới được UNESCO công nhận năm 2010",
      "Đoan Môn – cổng thành lịch sử của Hoàng cung",
      "Điện Kính Thiên và thềm rồng đá cổ",
      "Khu khảo cổ học 18 Hoàng Diệu",
      "Di tích gắn liền với lịch sử kinh đô Thăng Long hơn một nghìn năm"
    ],
    x: 520,
    y: 330,
    fullNameEn: "Imperial Citadel of Thang Long",
    descriptionEn: "The Imperial Citadel of Thang Long is one of Vietnam's most important historical complexes, reflecting more than a thousand years of the history of Thang Long – Hanoi. Established in the 11th century under the Ly dynasty, it served as the political center of successive Vietnamese royal dynasties. In 2010, UNESCO inscribed the citadel on the World Heritage List in recognition of its outstanding historical, architectural, and archaeological significance. Key attractions include Doan Mon Gate, Kinh Thien Palace, the ancient stone dragon steps, and the archaeological site at 18 Hoang Dieu, making it an ideal destination for exploring Vietnam's rich cultural heritage.",
    shortIntroEn: "A UNESCO World Heritage Site in Hanoi, preserving the remains of an ancient imperial capital and over a thousand years of Vietnamese history.",
    neighborhoodEn: "19C Hoang Dieu Street, Ba Dinh Ward, Hanoi, Vietnam",
    bestForEn: "Historical exploration, heritage sightseeing, traditional architecture, photography, cultural tourism, and educational trips.",
    highlightsEn: [
      "UNESCO World Heritage Site inscribed in 2010",
      "Doan Mon – a historic gate of the imperial citadel",
      "Kinh Thien Palace and ancient stone dragon steps",
      "The archaeological site at 18 Hoang Dieu",
      "A historic complex associated with over a thousand years of Vietnamese imperial history"
    ],
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Imperial+Citadel+of+Thang+Long+Hanoi",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/91/Doan_Mon_Gate_1.jpg",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/9/91/Doan_Mon_Gate_1.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/d/d2/Doan_Mon_Hanoi.JPG",
      "https://upload.wikimedia.org/wikipedia/commons/1/1e/Doan_Gate_of_Thang_Long_Citadel%2C_Hanoi%2C_southwest_aspect_%2827141701170%29.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/5/56/Citadelle_de_Hanoi_2.jpg"
    ],
    lat: 21.0355,
    lng: 105.8412,
    displayOrder: 7
  },
  {
    id: "BTDTH",
    label: "Dân tộc học",
    fullName: "Bảo tàng Dân tộc học Việt Nam",
    category: "Danh lam thắng cảnh",
    description: "Được thành lập năm 1981 và chính thức mở cửa đón khách vào năm 1997, Bảo tàng Dân tộc học Việt Nam là một trong những trung tâm nghiên cứu và trưng bày văn hóa dân tộc tiêu biểu của Việt Nam. Bảo tàng giới thiệu đời sống, phong tục, tín ngưỡng và bản sắc văn hóa của 54 dân tộc Việt Nam thông qua hàng nghìn hiện vật, hình ảnh và tư liệu quý giá. Điểm nhấn đặc biệt là khu trưng bày ngoài trời với những công trình kiến trúc dân gian được tái hiện như nhà dài Ê Đê, nhà rông Ba Na và nhà sàn truyền thống. Đây là điểm đến lý tưởng để tìm hiểu sự đa dạng văn hóa và di sản của các cộng đồng dân tộc Việt Nam.",
    shortIntro: "Không gian khám phá văn hóa đặc sắc của 54 dân tộc Việt Nam, nổi bật với bộ sưu tập hiện vật phong phú và các công trình kiến trúc dân gian ngoài trời.",
    neighborhood: "Đường Nguyễn Văn Huyên, phường Nghĩa Đô, Hà Nội, Việt Nam",
    bestFor: "Tìm hiểu văn hóa dân tộc, tham quan gia đình, hoạt động giáo dục ngoại khóa, nghiên cứu văn hóa, chụp ảnh kiến trúc truyền thống.",
    highlights: [
      "Bộ sưu tập hiện vật văn hóa của 54 dân tộc Việt Nam",
      "Khu trưng bày ngoài trời với các công trình kiến trúc dân gian",
      "Nhà dài Ê Đê, nhà rông Ba Na và nhà sàn truyền thống",
      "Các triển lãm về phong tục, trang phục và đời sống cộng đồng",
      "Hoạt động trải nghiệm văn hóa và giáo dục dành cho khách tham quan"
    ],
    x: 240,
    y: 280,
    fullNameEn: "Vietnam Museum of Ethnology",
    descriptionEn: "Established in 1981 and officially opened to the public in 1997, the Vietnam Museum of Ethnology is one of the country's leading institutions for researching and exhibiting ethnic cultures. The museum explores the lifestyles, customs, beliefs, and cultural identities of Vietnam's 54 ethnic groups through thousands of valuable artifacts, photographs, and documents. A major highlight is the outdoor exhibition area, featuring traditional structures such as an Ede longhouse, a Ba Na communal house, and traditional stilt houses. It is an ideal destination for discovering Vietnam's cultural diversity and the heritage of its ethnic communities.",
    shortIntroEn: "A fascinating exploration of the cultures of Vietnam's 54 ethnic groups, featuring extensive collections and traditional architecture in an outdoor exhibition area.",
    neighborhoodEn: "Nguyen Van Huyen Street, Nghia Do Ward, Hanoi, Vietnam",
    bestForEn: "Ethnic culture, family visits, educational field trips, cultural research, and traditional architecture photography.",
    highlightsEn: [
      "Cultural artifacts representing Vietnam's 54 ethnic groups",
      "Outdoor exhibition area featuring traditional architecture",
      "Ede longhouse, Ba Na communal house, and traditional stilt houses",
      "Exhibitions on customs, clothing, and community life",
      "Cultural activities and educational experiences for visitors"
    ],
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Vietnam+Museum+of+Ethnology+Hanoi",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Dan_toc_hoc_1.jpg",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/f/f3/Dan_toc_hoc_1.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/7/70/Vietnamese_stilt_house.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/1/1f/Dan_toc_hoc_19.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/0/04/Ede_longhouse%2C_Museum_of_Ethnology%2C_Hanoi_%2837608576475%29.jpg"
    ],
    lat: 21.0409,
    lng: 105.7982,
    displayOrder: 8
  },
  {
    id: "PTH",
    label: "Phủ Tây Hồ",
    fullName: "Phủ Tây Hồ",
    category: "Danh lam thắng cảnh",
    description: "Phủ Tây Hồ là một trong những địa điểm tâm linh nổi tiếng của Hà Nội, nằm trên bán đảo lớn nhô ra Hồ Tây, gắn liền với tín ngưỡng thờ Mẫu của người Việt. Phủ thờ Liễu Hạnh Công chúa, một trong Tứ bất tử trong tín ngưỡng dân gian Việt Nam. Với kiến trúc truyền thống, những cổng tam quan, mái ngói cong và các họa tiết chạm khắc tinh xảo, nơi đây thu hút đông đảo người dân và du khách đến dâng hương, cầu bình an, may mắn và tài lộc, đặc biệt vào dịp đầu năm và ngày rằm. Không gian ven Hồ Tây cũng mang đến khung cảnh thanh bình, đậm nét văn hóa tâm linh của Thủ đô.",
    shortIntro: "Di tích tâm linh nổi tiếng bên Hồ Tây, gắn với tín ngưỡng thờ Mẫu và truyền thuyết Liễu Hạnh Công chúa, thu hút đông đảo khách hành hương.",
    neighborhood: "Đường Đặng Thai Mai, phường Tây Hồ, Hà Nội, Việt Nam",
    bestFor: "Du lịch tâm linh, tìm hiểu tín ngưỡng thờ Mẫu, tham quan kiến trúc truyền thống, chụp ảnh, ngắm cảnh Hồ Tây.",
    highlights: [
      "Nơi thờ Liễu Hạnh Công chúa",
      "Không gian tín ngưỡng thờ Mẫu đặc trưng của Việt Nam",
      "Kiến trúc truyền thống với cổng tam quan và mái ngói cong",
      "Vị trí trên bán đảo ven Hồ Tây",
      "Lễ hội và hoạt động dâng hương vào dịp đầu năm"
    ],
    x: 430,
    y: 120,
    fullNameEn: "Tay Ho Temple",
    descriptionEn: "Tay Ho Temple is one of Hanoi's most famous spiritual destinations, situated on a peninsula extending into West Lake and closely associated with Vietnam's Mother Goddess worship tradition. The temple is dedicated to Princess Lieu Hanh, one of the Four Immortals in Vietnamese folk belief. Featuring traditional architecture, triple gates, curved tiled roofs, and intricate decorative carvings, it attracts worshippers and visitors who come to pray for peace, good fortune, and prosperity, especially during the Lunar New Year and full-moon days. Its lakeside setting also offers a peaceful atmosphere and a glimpse into Hanoi's spiritual and cultural heritage.",
    shortIntroEn: "A renowned spiritual site beside West Lake, associated with Mother Goddess worship and the legend of Princess Lieu Hanh.",
    neighborhoodEn: "Dang Thai Mai Street, Tay Ho Ward, Hanoi, Vietnam",
    bestForEn: "Spiritual tourism, exploring Mother Goddess worship, traditional architecture, photography, and West Lake scenery.",
    highlightsEn: [
      "Dedicated to Princess Lieu Hanh",
      "A significant site of Vietnamese Mother Goddess worship",
      "Traditional architecture with triple gates and curved tiled roofs",
      "A scenic peninsula location beside West Lake",
      "Worship ceremonies and festivals, especially during the Lunar New Year"
    ],
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Tay+Ho+Temple+Hanoi",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1e/Ph%E1%BB%A7_T%C3%A2y_H%E1%BB%93.jpg",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/1/1e/Ph%E1%BB%A7_T%C3%A2y_H%E1%BB%93.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/0/0e/Phu_Tay_Ho_in_2015_01.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/0/09/West_Lake_Hanoi.jpg"
    ],
    lat: 21.0587,
    lng: 105.8232,
    displayOrder: 9
  },
  {
    id: "HT",
    label: "Hồ Tây",
    fullName: "Hồ Tây",
    category: "Danh lam thắng cảnh",
    description: "Hồ Tây là hồ nước tự nhiên lớn nhất nội thành Hà Nội, nổi tiếng với cảnh quan thơ mộng, mặt nước rộng lớn và những hàng cây xanh rợp bóng ven hồ. Nơi đây không chỉ là điểm thư giãn yêu thích của người dân Thủ đô mà còn gắn liền với nhiều di tích lịch sử, văn hóa như chùa Trấn Quốc, phủ Tây Hồ và đền Quán Thánh. Đặc biệt, khung cảnh hoàng hôn trên mặt hồ cùng những con đường ven hồ thoáng đãng tạo nên sức hút riêng, thu hút du khách đến dạo bộ, đạp xe, chụp ảnh và thưởng thức ẩm thực địa phương.",
    shortIntro: "Hồ nước tự nhiên lớn nhất nội thành Hà Nội, nổi bật với cảnh hoàng hôn lãng mạn, đường ven hồ thơ mộng và nhiều di tích văn hóa lâu đời.",
    neighborhood: "Khu vực Hồ Tây, quận Tây Hồ, Hà Nội, Việt Nam",
    bestFor: "Ngắm hoàng hôn, đi dạo ven hồ, đạp xe, chụp ảnh check-in, thưởng thức ẩm thực và khám phá di tích lịch sử.",
    highlights: [
      "Cảnh hoàng hôn tuyệt đẹp trên mặt hồ",
      "Đường Thanh Niên và những hàng cây xanh ven hồ",
      "Chùa Trấn Quốc nằm bên hồ",
      "Phủ Tây Hồ và các di tích văn hóa lân cận",
      "Nhiều quán cà phê, nhà hàng với tầm nhìn hướng hồ"
    ],
    x: 400,
    y: 180,
    fullNameEn: "West Lake, Hanoi",
    descriptionEn: "West Lake is the largest natural lake within central Hanoi, renowned for its scenic waterfront, expansive waters, and tree-lined promenades. It is a favorite recreational destination for locals and visitors alike and is surrounded by historical and cultural landmarks such as Tran Quoc Pagoda, Tay Ho Temple, and Quan Thanh Temple. The romantic sunsets over the lake and peaceful lakeside roads make it an appealing place for walking, cycling, photography, and enjoying local cuisine.",
    shortIntroEn: "Hanoi's largest urban lake, famous for romantic sunsets, scenic waterfront paths, and historic cultural landmarks.",
    neighborhoodEn: "West Lake area, Tay Ho District, Hanoi, Vietnam",
    bestForEn: "Sunset watching, lakeside walks, cycling, photography, local cuisine, and exploring historical landmarks.",
    highlightsEn: [
      "Beautiful sunsets over the lake",
      "Thanh Nien Street and tree-lined waterfront",
      "Tran Quoc Pagoda beside the lake",
      "Tay Ho Temple and nearby cultural landmarks",
      "Cafes and restaurants with lake views"
    ],
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=West+Lake+Hanoi",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Hoang_hon_tren_Ho_Tay.jpg",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/e/e4/Hoang_hon_tren_Ho_Tay.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/9/9a/West_Lake_%28Hanoi%29.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/e/e5/Ch%C3%B9a_Tr%E1%BA%A5n_Qu%E1%BB%91c%2C_H%C3%A0_N%E1%BB%99i.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/0/09/West_Lake_Hanoi.jpg"
    ],
    lat: 21.0479,
    lng: 105.8368,
    displayOrder: 10
  },
  {
    id: "CHUAMOTCOT",
    label: "Chùa Một Cột",
    fullName: "Chùa Một Cột",
    category: "Danh lam thắng cảnh",
    description: "Chùa Một Cột là một trong những công trình kiến trúc Phật giáo tiêu biểu và độc đáo nhất của Việt Nam, được xây dựng vào năm 1049 dưới triều vua Lý Thái Tông. Ngôi chùa nổi bật với kiến trúc tựa đóa sen vươn lên từ mặt nước, đặt trên một cột đá duy nhất, tượng trưng cho sự thanh cao và tinh khiết. Gắn liền với truyền thuyết vua Lý Thái Tông nằm mộng thấy Quan Âm ngồi trên đài sen, chùa trở thành điểm đến tâm linh và di sản văn hóa nổi tiếng của Hà Nội. Với vẻ đẹp cổ kính cùng giá trị lịch sử lâu đời, nơi đây thu hút đông đảo du khách trong nước và quốc tế đến tham quan, chiêm bái và tìm hiểu văn hóa Phật giáo Việt Nam.",
    shortIntro: "Biểu tượng kiến trúc Phật giáo độc đáo của Hà Nội, nổi tiếng với ngôi chùa nhỏ hình đóa sen được nâng đỡ bởi một cột đá giữa hồ.",
    neighborhood: "Phố Chùa Một Cột, phường Ba Đình, Hà Nội, Việt Nam",
    bestFor: "Tham quan di tích lịch sử, du lịch tâm linh, khám phá kiến trúc Phật giáo, chụp ảnh và tìm hiểu văn hóa Việt Nam.",
    highlights: [
      "Kiến trúc độc đáo hình đóa sen trên một cột đá",
      "Được xây dựng năm 1049 dưới triều Lý",
      "Gắn liền với truyền thuyết vua Lý Thái Tông và Quan Âm",
      "Di tích kiến trúc nghệ thuật quốc gia đặc biệt",
      "Nằm gần Lăng Chủ tịch Hồ Chí Minh và Quảng trường Ba Đình"
    ],
    x: 460,
    y: 330,
    fullNameEn: "One Pillar Pagoda",
    descriptionEn: "One Pillar Pagoda is one of Vietnam's most distinctive Buddhist architectural landmarks, originally built in 1049 during the reign of Emperor Ly Thai Tong. The pagoda is renowned for its lotus-shaped structure rising above a pond, supported by a single stone pillar and symbolizing purity and spiritual elegance. According to legend, Emperor Ly Thai Tong dreamed of the Bodhisattva Avalokitesvara seated on a lotus throne, inspiring the construction of the pagoda. With its historic significance and unique design, it is a popular destination for domestic and international visitors interested in Vietnamese Buddhist culture and heritage.",
    shortIntroEn: "An iconic Buddhist landmark in Hanoi, famous for its small lotus-shaped pagoda supported by a single stone pillar above a pond.",
    neighborhoodEn: "One Pillar Pagoda Street, Ba Dinh Ward, Hanoi, Vietnam",
    bestForEn: "Historical sightseeing, spiritual tourism, Buddhist architecture, photography, and Vietnamese cultural exploration.",
    highlightsEn: [
      "Unique lotus-shaped architecture supported by a single stone pillar",
      "Originally built in 1049 during the Ly dynasty",
      "Associated with the legend of Emperor Ly Thai Tong and Avalokitesvara",
      "A nationally recognized special architectural and artistic monument",
      "Located near the Ho Chi Minh Mausoleum and Ba Dinh Square"
    ],
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=One+Pillar+Pagoda+Hanoi",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/90/One_Pillar_Pagoda_Hanoi.jpg",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/9/90/One_Pillar_Pagoda_Hanoi.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/f/f4/Chua_Mot_Cot.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/e/e4/Ch%C3%B9a_M%E1%BB%99t_C%E1%BB%99t_-_Di%C3%AAn_H%E1%BB%B1u_t%E1%BB%B1_-_H%C3%A0_N%E1%BB%99i_-_Ba_%C4%90%C3%ACnh_%281%29.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/5/5c/Hanoi%2C_Vietnam_%2812041825854%29.jpg"
    ],
    lat: 21.0359,
    lng: 105.8329,
    displayOrder: 12
  },
  {
    id: "LANDMARK72",
    label: "Landmark 72",
    fullName: "Keangnam Hanoi Landmark Tower",
    category: "Mua sắm",
    description: "Keangnam Hanoi Landmark Tower, thường được biết đến với tên Landmark 72, là tổ hợp cao ốc hiện đại nổi bật tại khu vực phía Tây Hà Nội. Hoàn thành năm 2011, công trình gồm tòa tháp chính cao 72 tầng cùng các khối văn phòng, khách sạn và khu dịch vụ đa chức năng. Với kiến trúc kính hiện đại và quy mô ấn tượng, Landmark 72 từng là một trong những tòa nhà cao nhất Việt Nam. Nơi đây tập trung nhiều dịch vụ văn phòng, khách sạn, nhà hàng và tiện ích giải trí, đồng thời là điểm nhấn kiến trúc của khu đô thị mới phía Tây Thủ đô.",
    shortIntro: "Tổ hợp cao ốc biểu tượng của phía Tây Hà Nội, nổi bật với tòa tháp 72 tầng, kiến trúc kính hiện đại và hệ thống dịch vụ thương mại đa dạng.",
    neighborhood: "Khu E6, đường Phạm Hùng, phường Yên Hòa, Hà Nội, Việt Nam",
    bestFor: "Tham quan kiến trúc hiện đại, lưu trú khách sạn, công tác, ăn uống, chụp ảnh đô thị và khám phá khu vực phía Tây Hà Nội.",
    highlights: [
      "Tòa tháp chính cao 72 tầng",
      "Kiến trúc kính hiện đại nổi bật trên đường chân trời Hà Nội",
      "Tổ hợp văn phòng và khách sạn cao cấp",
      "Nhiều nhà hàng, dịch vụ và tiện ích thương mại",
      "Vị trí tại khu đô thị phát triển phía Tây Thủ đô"
    ],
    x: 180,
    y: 460,
    fullNameEn: "Keangnam Hanoi Landmark Tower",
    descriptionEn: "Keangnam Hanoi Landmark Tower, commonly known as Landmark 72, is a prominent modern skyscraper complex in western Hanoi. Completed in 2011, the development features a 72-story main tower alongside office, hotel, and mixed-use facilities. With its contemporary glass architecture and impressive scale, Landmark 72 was once among the tallest buildings in Vietnam. The complex accommodates offices, hotel services, restaurants, and various amenities, making it a recognizable architectural landmark in Hanoi's rapidly developing western district.",
    shortIntroEn: "An iconic high-rise complex in western Hanoi, featuring a 72-story tower, modern glass architecture, and a range of commercial services.",
    neighborhoodEn: "E6 Area, Pham Hung Street, Yen Hoa Ward, Hanoi, Vietnam",
    bestForEn: "Modern architecture, hotel stays, business trips, dining, urban photography, and exploring western Hanoi.",
    highlightsEn: [
      "A 72-story main tower",
      "Modern glass architecture on Hanoi's skyline",
      "Office and hotel complex",
      "Restaurants, services, and commercial amenities",
      "Located in Hanoi's rapidly developing western district"
    ],
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Keangnam+Hanoi+Landmark+Tower",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/43/LANDMARK72.jpg",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/4/43/LANDMARK72.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/0/00/T%C3%B2a_nh%C3%A0_Keangnam_Hanoi_Landmark_Tower%2C_C%E1%BA%A7u_Gi%E1%BA%A5y%2C_H%C3%A0_N%E1%BB%99i_001.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/3/36/LANDMARK72_night.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/5/53/Keangnam-Hanoi-Landmark-Tower.jpg"
    ],
    lat: 21.0169,
    lng: 105.7831,
    displayOrder: 13
  },
  {
    id: "LANGLUAVANPHUC",
    label: "Làng lụa",
    fullName: "Làng lụa Vạn Phúc",
    category: "Danh lam thắng cảnh",
    description: "Làng lụa Vạn Phúc, thường được biết đến với tên gọi Làng lụa Hà Đông, là một trong những làng nghề dệt lụa truyền thống nổi tiếng nhất Việt Nam với lịch sử hàng nghìn năm. Nơi đây nổi bật với những sản phẩm lụa tơ tằm mềm mại, hoa văn tinh xảo và kỹ thuật dệt thủ công được truyền qua nhiều thế hệ. Khi đến thăm làng, du khách có thể khám phá những con ngõ cổ, tham quan các cửa hàng lụa, tìm hiểu quy trình dệt truyền thống và lựa chọn những món quà lưu niệm mang đậm bản sắc Việt Nam. Không gian làng nghề kết hợp giữa nét văn hóa xưa và nhịp sống hiện đại tạo nên điểm đến hấp dẫn cho những người yêu thích thủ công mỹ nghệ.",
    shortIntro: "Làng nghề dệt lụa truyền thống nổi tiếng của Hà Nội, thu hút du khách bởi những sản phẩm tơ tằm tinh xảo, con phố làng cổ kính và nét văn hóa thủ công lâu đời.",
    neighborhood: "Phường Vạn Phúc, Hà Đông, Hà Nội, Việt Nam",
    bestFor: "Khám phá làng nghề truyền thống, mua sắm lụa tơ tằm, tìm hiểu văn hóa Việt Nam, chụp ảnh, trải nghiệm thủ công mỹ nghệ.",
    highlights: [
      "Nghề dệt lụa tơ tằm truyền thống lâu đời",
      "Các cửa hàng trưng bày và bán sản phẩm lụa",
      "Khám phá ngõ phố và không gian làng nghề cổ",
      "Tìm hiểu quy trình dệt lụa thủ công",
      "Các sản phẩm khăn, áo và vải lụa làm quà lưu niệm"
    ],
    x: 150,
    y: 650,
    fullNameEn: "Van Phuc Silk Village",
    descriptionEn: "Van Phuc Silk Village, commonly known as Ha Dong Silk Village, is one of Vietnam's most renowned traditional silk-weaving villages, with a history spanning many centuries. It is celebrated for its soft silk products, intricate patterns, and hand-weaving techniques passed down through generations. Visitors can explore traditional village lanes, browse silk shops, learn about the silk-making process, and purchase souvenirs that reflect Vietnamese craftsmanship. The blend of traditional heritage and contemporary village life makes it an appealing destination for visitors interested in local culture and handicrafts.",
    shortIntroEn: "A famous traditional silk-weaving village in Hanoi, known for its finely crafted silk products, historic village lanes, and enduring handicraft heritage.",
    neighborhoodEn: "Van Phuc Ward, Ha Dong, Hanoi, Vietnam",
    bestForEn: "Traditional craft exploration, silk shopping, Vietnamese cultural experiences, photography, and handicrafts.",
    highlightsEn: [
      "A long-standing tradition of silk weaving",
      "Shops displaying and selling silk products",
      "Traditional village lanes and historic surroundings",
      "Insights into the handmade silk-weaving process",
      "Silk scarves, clothing, and fabrics suitable as souvenirs"
    ],
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Van+Phuc+Silk+Village+Ha+Dong+Hanoi",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/cb/V%E1%BA%A1n_Ph%C3%BAc.jpg",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/c/cb/V%E1%BA%A1n_Ph%C3%BAc.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/c/ce/L%E1%BB%A5aV%E1%BA%A1nPh%C3%BAc-2198867187_a0d4cdce3b_o.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/7/78/Van_Phuc_weaver_at_Jacquard_loom.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/7/77/Silk_weaving%2C_2003_Ha_Dong_2.jpg"
    ],
    lat: 20.9718,
    lng: 105.7765,
    displayOrder: 14
  },
  {
    id: "CVTN",
    label: "CV Thống Nhất",
    fullName: "Công viên Thống Nhất",
    category: "Công viên",
    description: "Được khởi công xây dựng từ năm 1958 bởi sự góp sức của đông đảo nhân dân và thanh niên Thủ đô, Công viên Thống Nhất là một trong những công viên lớn và lâu đời nhất tại Hà Nội. Với diện tích hơn 50 hecta, trung tâm là hồ Bảy Mẫu trong xanh cùng các đảo xanh mát (đảo Hòa Bình, đảo Thống Nhất), công viên được mệnh danh là 'lá phổi xanh' của Thủ đô. Nơi đây sở hữu cổng vòm hoa vàng cổ kính đặc trưng, những rặng cây rợp bóng mát, vườn hoa muôn sắc và không gian thoáng đãng lý tưởng cho người dân dạo bộ, tập thể dục, ngắm cảnh và tổ chức các hoạt động văn hóa, dã ngoại giữa lòng đô thị.",
    shortIntro: "Lá phổi xanh lịch sử lớn bậc nhất Thủ đô với hồ Bảy Mẫu thoáng mát, cổng chào hoa vàng đặc trưng và không gian dạo bộ thư thái.",
    imageUrl: "/assets/aistudio/image_c52147f0.png",
    neighborhood: "354A Đường Lê Duẩn, Phường Phương Liên, Quận Đống Đa & Hai Bà Trưng, Hà Nội",
    bestFor: "Dạo bộ, Chụp ảnh, Thể thao ngoài trời, Dã ngoại, Du lịch sinh thái đô thị",
    highlights: [
      "Hồ Bảy Mẫu rộng lớn và đảo Hòa Bình rợp bóng cây",
      "Cổng chào kiến trúc vòm hoa vàng đặc trưng từ năm 1958",
      "Lá phổi xanh lịch sử lâu đời gắn liền với khát vọng thống nhất non sông",
      "Vị trí đắc địa gần THPT Thăng Long và các trường đại học khu Bách Khoa"
    ],
    x: 470,
    y: 480,
    fullNameEn: "Thong Nhat Park",
    descriptionEn: "Constructed in 1958 through the volunteer labor of Hanoi's citizens and youth, Thong Nhat Park is one of the largest and oldest public parks in Hanoi. Spanning over 50 hectares with the picturesque Bay Mau Lake at its center alongside lush green islets (Peace Islet), the park is widely known as the 'green lung' of the capital. Featuring iconic yellow floral entrance arches, tree-lined promenades, colorful flower gardens, and open waterfront breezes, it is a beloved haven for jogging, outdoor photography, cultural festivals, and peaceful relaxation.",
    shortIntroEn: "One of Hanoi's largest and most historic urban green lungs, featuring Bay Mau Lake, iconic yellow entrance gates, and relaxing tree-lined walks.",
    neighborhoodEn: "354A Le Duan Street, Phuong Lien Ward, Dong Da & Hai Ba Trung Districts, Hanoi, Vietnam",
    bestForEn: "Walking, Photography, Outdoor sports, Picnics, Urban nature relaxation",
    highlightsEn: [
      "Vast Bay Mau Lake and tranquil green islets",
      "Iconic historic yellow archway entrance built in 1958",
      "Historic green lung symbolizing Vietnam's aspiration for national reunification",
      "Prime location just minutes away from Thang Long High School"
    ],
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Cong+Vien+Thong+Nhat+Hanoi+Vietnam",
    images: [
      "/assets/aistudio/image_c52147f0.png",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Cong_vien_Thong_Nhat_Hanoi.jpg/1280px-Cong_vien_Thong_Nhat_Hanoi.jpg",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
    ],
    lat: 21.0167,
    lng: 105.8435,
    displayOrder: 15
  },
  {
    id: "DHBKHN",
    label: "ĐH Bách Khoa",
    fullName: "Đại học Bách khoa Hà Nội",
    category: "Di sản học đường",
    description: "Thành lập năm 1956, Đại học Bách khoa Hà Nội là trường đại học kỹ thuật đầu tiên và hàng đầu của Việt Nam, cái nôi đào tạo nhiều thế hệ kỹ sư, nhà khoa học và lãnh đạo ưu tú của đất nước. Tọa lạc trên khuôn viên rộng hơn 26 hecta rợp bóng cây cổ thụ giữa trung tâm quận Hai Bà Trưng, trường nổi tiếng với cổng Parabol huyền thoại, thư viện Tạ Quang Bửu hiện đại bậc nhất, quảng trường C1 cổ kính và bức biển đá hoa cương đặc trưng. Nằm tiếp giáp ngay cạnh THPT Thăng Long trên phố Tạ Quang Bửu, Bách Khoa là biểu tượng của tinh thần học thuật xuất sắc, sáng tạo công nghệ và niềm tự hào tri thức Thủ đô.",
    shortIntro: "Trường đại học kỹ thuật trọng điểm hàng đầu Việt Nam thành lập năm 1956, cái nôi khoa học công nghệ với khuôn viên xanh mát nằm sát cạnh THPT Thăng Long.",
    imageUrl: "/assets/aistudio/image_2c77b42f.png",
    neighborhood: "Số 1 Đại Cồ Việt & Phố Tạ Quang Bửu, Phường Bách Khoa, Quận Hai Bà Trưng, Hà Nội",
    bestFor: "Tham quan học đường, Chụp ảnh, Giao lưu học thuật, Khám phá công nghệ, Dạo bộ",
    highlights: [
      "Trường đại học kỹ thuật hàng đầu và lâu đời nhất Việt Nam (thành lập 1956)",
      "Thư viện Tạ Quang Bửu đồ sộ và Quảng trường C1 lịch sử",
      "Cổng Parabol nổi tiếng cùng tấm biển đá hoa cương đặc trưng",
      "Nằm tiếp giáp ngay cạnh trường THPT Thăng Long trong cùng quần thể Bách Khoa"
    ],
    x: 440,
    y: 530,
    fullNameEn: "Hanoi University of Science and Technology",
    descriptionEn: "Established in 1956, Hanoi University of Science and Technology (HUST) is Vietnam's first and most prestigious multidisciplinary technical university, having educated generations of leading engineers, scientists, and national leaders. Spanning over 26 hectares filled with lush greenery and shaded avenues in Hai Ba Trung District, HUST is renowned for its iconic Parabolic Gate, state-of-the-art Ta Quang Buu Library, and historic C1 Building square. Situated directly adjacent to Thang Long High School along Ta Quang Buu Street, HUST represents the pinnacle of Vietnamese technological innovation and academic excellence.",
    shortIntroEn: "Vietnam's premier technical and research university founded in 1956, renowned for its green campus, iconic Parabolic Gate, and neighboring Thang Long High School.",
    neighborhoodEn: "1 Dai Co Viet & Ta Quang Buu St, Bach Khoa Ward, Hai Ba Trung District, Hanoi, Vietnam",
    bestForEn: "Campus tour, Photography, Academic exchange, Technology exploration, Walking",
    highlightsEn: [
      "Vietnam's first and leading technical university founded in 1956",
      "Landmark Ta Quang Buu Library and historic C1 Square",
      "Iconic Parabolic Gate and signature engraved granite entrance monument",
      "Directly neighboring Thang Long High School along Ta Quang Buu Street"
    ],
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Hanoi+University+of+Science+and+Technology",
    images: [
      "/assets/aistudio/image_2c77b42f.png",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/HUST_Library.jpg/1280px-HUST_Library.jpg",
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80"
    ],
    lat: 21.0055,
    lng: 105.8433,
    displayOrder: 16
  }
];

export const INITIAL_ROUTES: Route[] = [
  {
    "id": "TL__BH",
    "from": "TL",
    "to": "BH",
    "distanceKm": 3.8,
    "isArterial": true
  },
  {
    "id": "TL__CDX",
    "from": "TL",
    "to": "CDX",
    "distanceKm": 4.7,
    "isArterial": false
  },
  {
    "id": "TL__CTL",
    "from": "TL",
    "to": "CTL",
    "distanceKm": 7.6,
    "isArterial": true
  },
  {
    "id": "TL__LOTTE",
    "from": "TL",
    "to": "LOTTE",
    "distanceKm": 6.7,
    "isArterial": true
  },
  {
    "id": "TL__HTTL",
    "from": "TL",
    "to": "HTTL",
    "distanceKm": 5.4,
    "isArterial": false
  },
  {
    "id": "TL__BTDTH",
    "from": "TL",
    "to": "BTDTH",
    "distanceKm": 9.1,
    "isArterial": false
  },
  {
    "id": "TL__PTH",
    "from": "TL",
    "to": "PTH",
    "distanceKm": 9.3,
    "isArterial": false
  },
  {
    "id": "TL__CHUAMOTCOT",
    "from": "TL",
    "to": "CHUAMOTCOT",
    "distanceKm": 5.6,
    "isArterial": false
  },
  {
    "id": "TL__LANDMARK72",
    "from": "TL",
    "to": "LANDMARK72",
    "distanceKm": 9.1,
    "isArterial": true
  },
  {
    "id": "TL__LANGLUAVANPHUC",
    "from": "TL",
    "to": "LANGLUAVANPHUC",
    "distanceKm": 9.6,
    "isArterial": true
  },
  {
    "id": "BH__CDX",
    "from": "BH",
    "to": "CDX",
    "distanceKm": 1.4,
    "isArterial": true
  },
  {
    "id": "BH__CTL",
    "from": "BH",
    "to": "CTL",
    "distanceKm": 6.8,
    "isArterial": false
  },
  {
    "id": "BH__LCT",
    "from": "BH",
    "to": "LCT",
    "distanceKm": 3.4,
    "isArterial": false
  },
  {
    "id": "BH__LOTTE",
    "from": "BH",
    "to": "LOTTE",
    "distanceKm": 5.4,
    "isArterial": false
  },
  {
    "id": "BH__VMQTG",
    "from": "BH",
    "to": "VMQTG",
    "distanceKm": 3.1,
    "isArterial": true
  },
  {
    "id": "BH__HTTL",
    "from": "BH",
    "to": "HTTL",
    "distanceKm": 2.6,
    "isArterial": true
  },
  {
    "id": "BH__BTDTH",
    "from": "BH",
    "to": "BTDTH",
    "distanceKm": 7.5,
    "isArterial": false
  },
  {
    "id": "BH__PTH",
    "from": "BH",
    "to": "PTH",
    "distanceKm": 6.6,
    "isArterial": false
  },
  {
    "id": "BH__HT",
    "from": "BH",
    "to": "HT",
    "distanceKm": 4.2,
    "isArterial": true
  },
  {
    "id": "BH__CHUAMOTCOT",
    "from": "BH",
    "to": "CHUAMOTCOT",
    "distanceKm": 3.6,
    "isArterial": false
  },
  {
    "id": "BH__LANDMARK72",
    "from": "BH",
    "to": "LANDMARK72",
    "distanceKm": 9.8,
    "isArterial": false
  },
  {
    "id": "BH__LANGLUAVANPHUC",
    "from": "BH",
    "to": "LANGLUAVANPHUC",
    "distanceKm": 11.8,
    "isArterial": false
  },
  {
    "id": "CDX__CTL",
    "from": "CDX",
    "to": "CTL",
    "distanceKm": 6.5,
    "isArterial": false
  },
  {
    "id": "CDX__LCT",
    "from": "CDX",
    "to": "LCT",
    "distanceKm": 2.9,
    "isArterial": false
  },
  {
    "id": "CDX__LOTTE",
    "from": "CDX",
    "to": "LOTTE",
    "distanceKm": 5,
    "isArterial": false
  },
  {
    "id": "CDX__VMQTG",
    "from": "CDX",
    "to": "VMQTG",
    "distanceKm": 2.7,
    "isArterial": false
  },
  {
    "id": "CDX__HTTL",
    "from": "CDX",
    "to": "HTTL",
    "distanceKm": 2,
    "isArterial": true
  },
  {
    "id": "CDX__BTDTH",
    "from": "CDX",
    "to": "BTDTH",
    "distanceKm": 6.9,
    "isArterial": false
  },
  {
    "id": "CDX__PTH",
    "from": "CDX",
    "to": "PTH",
    "distanceKm": 5,
    "isArterial": true
  },
  {
    "id": "CDX__HT",
    "from": "CDX",
    "to": "HT",
    "distanceKm": 2.6,
    "isArterial": true
  },
  {
    "id": "CDX__CHUAMOTCOT",
    "from": "CDX",
    "to": "CHUAMOTCOT",
    "distanceKm": 3.2,
    "isArterial": false
  },
  {
    "id": "CDX__LANDMARK72",
    "from": "CDX",
    "to": "LANDMARK72",
    "distanceKm": 9.4,
    "isArterial": false
  },
  {
    "id": "CDX__LANGLUAVANPHUC",
    "from": "CDX",
    "to": "LANGLUAVANPHUC",
    "distanceKm": 11.7,
    "isArterial": false
  },
  {
    "id": "CTL__LCT",
    "from": "CTL",
    "to": "LCT",
    "distanceKm": 4.8,
    "isArterial": false
  },
  {
    "id": "CTL__LOTTE",
    "from": "CTL",
    "to": "LOTTE",
    "distanceKm": 1.6,
    "isArterial": false
  },
  {
    "id": "CTL__VMQTG",
    "from": "CTL",
    "to": "VMQTG",
    "distanceKm": 4.5,
    "isArterial": false
  },
  {
    "id": "CTL__HTTL",
    "from": "CTL",
    "to": "HTTL",
    "distanceKm": 5.7,
    "isArterial": false
  },
  {
    "id": "CTL__BTDTH",
    "from": "CTL",
    "to": "BTDTH",
    "distanceKm": 2.4,
    "isArterial": true
  },
  {
    "id": "CTL__PTH",
    "from": "CTL",
    "to": "PTH",
    "distanceKm": 9.4,
    "isArterial": false
  },
  {
    "id": "CTL__HT",
    "from": "CTL",
    "to": "HT",
    "distanceKm": 6,
    "isArterial": false
  },
  {
    "id": "CTL__CHUAMOTCOT",
    "from": "CTL",
    "to": "CHUAMOTCOT",
    "distanceKm": 4.4,
    "isArterial": false
  },
  {
    "id": "CTL__LANDMARK72",
    "from": "CTL",
    "to": "LANDMARK72",
    "distanceKm": 4.2,
    "isArterial": true
  },
  {
    "id": "CTL__LANGLUAVANPHUC",
    "from": "CTL",
    "to": "LANGLUAVANPHUC",
    "distanceKm": 10,
    "isArterial": false
  },
  {
    "id": "LCT__LOTTE",
    "from": "LCT",
    "to": "LOTTE",
    "distanceKm": 3.3,
    "isArterial": false
  },
  {
    "id": "LCT__HTTL",
    "from": "LCT",
    "to": "HTTL",
    "distanceKm": 2,
    "isArterial": true
  },
  {
    "id": "LCT__BTDTH",
    "from": "LCT",
    "to": "BTDTH",
    "distanceKm": 5.5,
    "isArterial": false
  },
  {
    "id": "LCT__PTH",
    "from": "LCT",
    "to": "PTH",
    "distanceKm": 5.6,
    "isArterial": false
  },
  {
    "id": "LCT__CHUAMOTCOT",
    "from": "LCT",
    "to": "CHUAMOTCOT",
    "distanceKm": 0.4,
    "isArterial": true
  },
  {
    "id": "LCT__LANDMARK72",
    "from": "LCT",
    "to": "LANDMARK72",
    "distanceKm": 7.7,
    "isArterial": false
  },
  {
    "id": "LCT__LANGLUAVANPHUC",
    "from": "LCT",
    "to": "LANGLUAVANPHUC",
    "distanceKm": 10.3,
    "isArterial": false
  },
  {
    "id": "LOTTE__VMQTG",
    "from": "LOTTE",
    "to": "VMQTG",
    "distanceKm": 3.1,
    "isArterial": false
  },
  {
    "id": "LOTTE__HTTL",
    "from": "LOTTE",
    "to": "HTTL",
    "distanceKm": 4.3,
    "isArterial": false
  },
  {
    "id": "LOTTE__BTDTH",
    "from": "LOTTE",
    "to": "BTDTH",
    "distanceKm": 2.3,
    "isArterial": true
  },
  {
    "id": "LOTTE__PTH",
    "from": "LOTTE",
    "to": "PTH",
    "distanceKm": 8,
    "isArterial": false
  },
  {
    "id": "LOTTE__HT",
    "from": "LOTTE",
    "to": "HT",
    "distanceKm": 4.7,
    "isArterial": false
  },
  {
    "id": "LOTTE__CHUAMOTCOT",
    "from": "LOTTE",
    "to": "CHUAMOTCOT",
    "distanceKm": 2.9,
    "isArterial": false
  },
  {
    "id": "LOTTE__LANDMARK72",
    "from": "LOTTE",
    "to": "LANDMARK72",
    "distanceKm": 4.6,
    "isArterial": true
  },
  {
    "id": "LOTTE__LANGLUAVANPHUC",
    "from": "LOTTE",
    "to": "LANGLUAVANPHUC",
    "distanceKm": 9.4,
    "isArterial": false
  },
  {
    "id": "VMQTG__HTTL",
    "from": "VMQTG",
    "to": "HTTL",
    "distanceKm": 2.2,
    "isArterial": true
  },
  {
    "id": "VMQTG__BTDTH",
    "from": "VMQTG",
    "to": "BTDTH",
    "distanceKm": 5.3,
    "isArterial": false
  },
  {
    "id": "VMQTG__PTH",
    "from": "VMQTG",
    "to": "PTH",
    "distanceKm": 6.1,
    "isArterial": false
  },
  {
    "id": "VMQTG__CHUAMOTCOT",
    "from": "VMQTG",
    "to": "CHUAMOTCOT",
    "distanceKm": 1.6,
    "isArterial": false
  },
  {
    "id": "VMQTG__LANDMARK72",
    "from": "VMQTG",
    "to": "LANDMARK72",
    "distanceKm": 7.5,
    "isArterial": false
  },
  {
    "id": "VMQTG__LANGLUAVANPHUC",
    "from": "VMQTG",
    "to": "LANGLUAVANPHUC",
    "distanceKm": 9.4,
    "isArterial": false
  },
  {
    "id": "HTTL__BTDTH",
    "from": "HTTL",
    "to": "BTDTH",
    "distanceKm": 6.4,
    "isArterial": false
  },
  {
    "id": "HTTL__PTH",
    "from": "HTTL",
    "to": "PTH",
    "distanceKm": 4.9,
    "isArterial": false
  },
  {
    "id": "HTTL__HT",
    "from": "HTTL",
    "to": "HT",
    "distanceKm": 2.3,
    "isArterial": true
  },
  {
    "id": "HTTL__CHUAMOTCOT",
    "from": "HTTL",
    "to": "CHUAMOTCOT",
    "distanceKm": 2.2,
    "isArterial": false
  },
  {
    "id": "HTTL__LANDMARK72",
    "from": "HTTL",
    "to": "LANDMARK72",
    "distanceKm": 8.7,
    "isArterial": false
  },
  {
    "id": "HTTL__LANGLUAVANPHUC",
    "from": "HTTL",
    "to": "LANGLUAVANPHUC",
    "distanceKm": 11,
    "isArterial": false
  },
  {
    "id": "BTDTH__PTH",
    "from": "BTDTH",
    "to": "PTH",
    "distanceKm": 9.2,
    "isArterial": false
  },
  {
    "id": "BTDTH__HT",
    "from": "BTDTH",
    "to": "HT",
    "distanceKm": 6.4,
    "isArterial": false
  },
  {
    "id": "BTDTH__CHUAMOTCOT",
    "from": "BTDTH",
    "to": "CHUAMOTCOT",
    "distanceKm": 4.8,
    "isArterial": false
  },
  {
    "id": "BTDTH__LANDMARK72",
    "from": "BTDTH",
    "to": "LANDMARK72",
    "distanceKm": 4,
    "isArterial": true
  },
  {
    "id": "BTDTH__LANGLUAVANPHUC",
    "from": "BTDTH",
    "to": "LANGLUAVANPHUC",
    "distanceKm": 10.8,
    "isArterial": false
  },
  {
    "id": "PTH__HT",
    "from": "PTH",
    "to": "HT",
    "distanceKm": 4.4,
    "isArterial": false
  },
  {
    "id": "PTH__CHUAMOTCOT",
    "from": "PTH",
    "to": "CHUAMOTCOT",
    "distanceKm": 5.9,
    "isArterial": false
  },
  {
    "id": "PTH__LANDMARK72",
    "from": "PTH",
    "to": "LANDMARK72",
    "distanceKm": 12.9,
    "isArterial": false
  },
  {
    "id": "PTH__LANGLUAVANPHUC",
    "from": "PTH",
    "to": "LANGLUAVANPHUC",
    "distanceKm": 14.9,
    "isArterial": false
  },
  {
    "id": "HT__CHUAMOTCOT",
    "from": "HT",
    "to": "CHUAMOTCOT",
    "distanceKm": 2.7,
    "isArterial": false
  },
  {
    "id": "HT__LANDMARK72",
    "from": "HT",
    "to": "LANDMARK72",
    "distanceKm": 9,
    "isArterial": false
  },
  {
    "id": "HT__LANGLUAVANPHUC",
    "from": "HT",
    "to": "LANGLUAVANPHUC",
    "distanceKm": 11.8,
    "isArterial": false
  },
  {
    "id": "CHUAMOTCOT__LANDMARK72",
    "from": "CHUAMOTCOT",
    "to": "LANDMARK72",
    "distanceKm": 7.4,
    "isArterial": false
  },
  {
    "id": "CHUAMOTCOT__LANGLUAVANPHUC",
    "from": "CHUAMOTCOT",
    "to": "LANGLUAVANPHUC",
    "distanceKm": 10.2,
    "isArterial": false
  },
  {
    "id": "LANDMARK72__LANGLUAVANPHUC",
    "from": "LANDMARK72",
    "to": "LANGLUAVANPHUC",
    "distanceKm": 7.1,
    "isArterial": true
  },
  {
    "id": "BH__CVTN",
    "from": "BH",
    "to": "CVTN",
    "distanceKm": 2.7,
    "isArterial": true
  },
  {
    "id": "CDX__CVTN",
    "from": "CDX",
    "to": "CVTN",
    "distanceKm": 3.1,
    "isArterial": false
  },
  {
    "id": "CTL__CVTN",
    "from": "CTL",
    "to": "CVTN",
    "distanceKm": 6,
    "isArterial": false
  },
  {
    "id": "LOTTE__CVTN",
    "from": "LOTTE",
    "to": "CVTN",
    "distanceKm": 4.9,
    "isArterial": false
  },
  {
    "id": "HTTL__CVTN",
    "from": "HTTL",
    "to": "CVTN",
    "distanceKm": 3.1,
    "isArterial": false
  },
  {
    "id": "BTDTH__CVTN",
    "from": "BTDTH",
    "to": "CVTN",
    "distanceKm": 7.1,
    "isArterial": false
  },
  {
    "id": "PTH__CVTN",
    "from": "PTH",
    "to": "CVTN",
    "distanceKm": 7.3,
    "isArterial": false
  },
  {
    "id": "CHUAMOTCOT__CVTN",
    "from": "CHUAMOTCOT",
    "to": "CVTN",
    "distanceKm": 3.2,
    "isArterial": false
  },
  {
    "id": "LANDMARK72__CVTN",
    "from": "LANDMARK72",
    "to": "CVTN",
    "distanceKm": 8.8,
    "isArterial": true
  },
  {
    "id": "LANGLUAVANPHUC__CVTN",
    "from": "LANGLUAVANPHUC",
    "to": "CVTN",
    "distanceKm": 9.6,
    "isArterial": false
  },
  {
    "id": "BH__DHBKHN",
    "from": "BH",
    "to": "DHBKHN",
    "distanceKm": 3.9,
    "isArterial": true
  },
  {
    "id": "CDX__DHBKHN",
    "from": "CDX",
    "to": "DHBKHN",
    "distanceKm": 4.8,
    "isArterial": false
  },
  {
    "id": "CTL__DHBKHN",
    "from": "CTL",
    "to": "DHBKHN",
    "distanceKm": 7,
    "isArterial": false
  },
  {
    "id": "LOTTE__DHBKHN",
    "from": "LOTTE",
    "to": "DHBKHN",
    "distanceKm": 6.1,
    "isArterial": false
  },
  {
    "id": "HTTL__DHBKHN",
    "from": "HTTL",
    "to": "DHBKHN",
    "distanceKm": 5.1,
    "isArterial": false
  },
  {
    "id": "BTDTH__DHBKHN",
    "from": "BTDTH",
    "to": "DHBKHN",
    "distanceKm": 8.2,
    "isArterial": false
  },
  {
    "id": "PTH__DHBKHN",
    "from": "PTH",
    "to": "DHBKHN",
    "distanceKm": 9.2,
    "isArterial": false
  },
  {
    "id": "CHUAMOTCOT__DHBKHN",
    "from": "CHUAMOTCOT",
    "to": "DHBKHN",
    "distanceKm": 5.1,
    "isArterial": false
  },
  {
    "id": "LANDMARK72__DHBKHN",
    "from": "LANDMARK72",
    "to": "DHBKHN",
    "distanceKm": 8.8,
    "isArterial": true
  },
  {
    "id": "LANGLUAVANPHUC__DHBKHN",
    "from": "LANGLUAVANPHUC",
    "to": "DHBKHN",
    "distanceKm": 9.3,
    "isArterial": false
  },
  {
    "id": "TL__DHBKHN",
    "from": "TL",
    "to": "DHBKHN",
    "distanceKm": 1.4,
    "isArterial": true
  },
  {
    "id": "TL__CVTN",
    "from": "TL",
    "to": "CVTN",
    "distanceKm": 2.6,
    "isArterial": true
  },
  {
    "id": "TL__VMQTG",
    "from": "TL",
    "to": "VMQTG",
    "distanceKm": 4.8,
    "isArterial": false
  },
  {
    "id": "TL__LCT",
    "from": "TL",
    "to": "LCT",
    "distanceKm": 5.6,
    "isArterial": false
  },
  {
    "id": "TL__HT",
    "from": "TL",
    "to": "HT",
    "distanceKm": 9.3,
    "isArterial": true
  },
  {
    "id": "DHBKHN__TL",
    "from": "DHBKHN",
    "to": "TL",
    "distanceKm": 1.4,
    "isArterial": true
  },
  {
    "id": "DHBKHN__CVTN",
    "from": "DHBKHN",
    "to": "CVTN",
    "distanceKm": 2,
    "isArterial": true
  },
  {
    "id": "DHBKHN__VMQTG",
    "from": "DHBKHN",
    "to": "VMQTG",
    "distanceKm": 4.2,
    "isArterial": false
  },
  {
    "id": "DHBKHN__LCT",
    "from": "DHBKHN",
    "to": "LCT",
    "distanceKm": 5,
    "isArterial": false
  },
  {
    "id": "DHBKHN__HT",
    "from": "DHBKHN",
    "to": "HT",
    "distanceKm": 6.8,
    "isArterial": false
  },
  {
    "id": "CVTN__TL",
    "from": "CVTN",
    "to": "TL",
    "distanceKm": 2.6,
    "isArterial": true
  },
  {
    "id": "CVTN__DHBKHN",
    "from": "CVTN",
    "to": "DHBKHN",
    "distanceKm": 2,
    "isArterial": true
  },
  {
    "id": "CVTN__VMQTG",
    "from": "CVTN",
    "to": "VMQTG",
    "distanceKm": 2.6,
    "isArterial": true
  },
  {
    "id": "CVTN__LCT",
    "from": "CVTN",
    "to": "LCT",
    "distanceKm": 3.7,
    "isArterial": false
  },
  {
    "id": "CVTN__HT",
    "from": "CVTN",
    "to": "HT",
    "distanceKm": 6.3,
    "isArterial": false
  },
  {
    "id": "VMQTG__TL",
    "from": "VMQTG",
    "to": "TL",
    "distanceKm": 4.8,
    "isArterial": false
  },
  {
    "id": "VMQTG__DHBKHN",
    "from": "VMQTG",
    "to": "DHBKHN",
    "distanceKm": 4.2,
    "isArterial": false
  },
  {
    "id": "VMQTG__CVTN",
    "from": "VMQTG",
    "to": "CVTN",
    "distanceKm": 2.6,
    "isArterial": true
  },
  {
    "id": "VMQTG__LCT",
    "from": "VMQTG",
    "to": "LCT",
    "distanceKm": 1.4,
    "isArterial": true
  },
  {
    "id": "VMQTG__HT",
    "from": "VMQTG",
    "to": "HT",
    "distanceKm": 2.8,
    "isArterial": false
  },
  {
    "id": "LCT__TL",
    "from": "LCT",
    "to": "TL",
    "distanceKm": 5.6,
    "isArterial": false
  },
  {
    "id": "LCT__DHBKHN",
    "from": "LCT",
    "to": "DHBKHN",
    "distanceKm": 5,
    "isArterial": false
  },
  {
    "id": "LCT__CVTN",
    "from": "LCT",
    "to": "CVTN",
    "distanceKm": 3.7,
    "isArterial": false
  },
  {
    "id": "LCT__VMQTG",
    "from": "LCT",
    "to": "VMQTG",
    "distanceKm": 1.4,
    "isArterial": true
  },
  {
    "id": "LCT__HT",
    "from": "LCT",
    "to": "HT",
    "distanceKm": 2.2,
    "isArterial": true
  },
  {
    "id": "HT__TL",
    "from": "HT",
    "to": "TL",
    "distanceKm": 9.3,
    "isArterial": true
  },
  {
    "id": "HT__DHBKHN",
    "from": "HT",
    "to": "DHBKHN",
    "distanceKm": 6.8,
    "isArterial": false
  },
  {
    "id": "HT__CVTN",
    "from": "HT",
    "to": "CVTN",
    "distanceKm": 6.3,
    "isArterial": false
  },
  {
    "id": "HT__VMQTG",
    "from": "HT",
    "to": "VMQTG",
    "distanceKm": 2.8,
    "isArterial": false
  },
  {
    "id": "HT__LCT",
    "from": "HT",
    "to": "LCT",
    "distanceKm": 2.2,
    "isArterial": true
  }
];

export const INITIAL_GRAPH_DATA: GraphData = {
  locations: INITIAL_LOCATIONS,
  routes: INITIAL_ROUTES,
};

export const PRESET_SELECTIONS: PresetSelectionMap = {
  cycle: {
    ids: ["TL", "BH", "LCT", "BTDTH", "VMQTG"],
    label: "Chu trình 5 điểm gợi ý (Bờ Hồ – Lăng Bác – Dân tộc học – Văn Miếu)",
    desc: "THPT Thăng Long → Bờ Hồ Hà Nội → Lăng Bác → Bảo tàng Dân tộc học → Văn Miếu → THPT Thăng Long",
    startId: "TL",
    endId: "TL"
  },
  path: {
    ids: ["TL", "HT", "LOTTE", "LANDMARK72", "LANGLUAVANPHUC"],
    label: "Đường đi Hamilton 5 điểm gợi ý (Từ THPT Thăng Long)",
    desc: "THPT Thăng Long → Hồ Tây → Tòa nhà Lotte → Tòa nhà Keangnam → Làng lụa Vạn Phúc",
    startId: "TL",
    endId: "LANGLUAVANPHUC"
  },
  subset: {
    ids: ["TL", "BH", "VMQTG", "LOTTE", "BTDTH", "LANDMARK72"],
    label: "Tập hợp điểm Đông - Tây (Dijkstra)",
    desc: "THPT Thăng Long → Bờ Hồ → Văn Miếu → Lotte Center → Bảo tàng Dân tộc học → Keangnam Landmark 72",
    startId: "TL",
    endId: "LANDMARK72"
  }
};

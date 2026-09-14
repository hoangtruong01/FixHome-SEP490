// src/database/seeds/seed-catalog.ts
import { DataSource } from 'typeorm';

export async function seedCatalog(dataSource: DataSource): Promise<void> {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 1. Categories & Services (including 20 Fixed-Price services per Spec v1.2 Table 8.3.1)
    const categories = [
      {
        code: 'DIEN_LANH',
        name: 'Điện lạnh',
        slug: 'dien-lanh',
        iconKey: 'Snowflake',
        sortOrder: 1,
        description: 'Sửa chữa và bảo dưỡng điều hòa, tủ lạnh, máy giặt tận nhà',
        services: [
          // ── Fixed Price Services (Table 8.3.1) ──
          {
            code: 'VE_SINH_DIEU_HOA_1HP',
            name: 'Vệ sinh điều hòa treo tường 1–1.5 HP',
            slug: 've-sinh-dieu-hoa-1hp',
            pricingMode: 'fixed_price',
            unit: 'Máy',
            fixedPrice: 180000,
            basePrice: 180000,
            minPrice: 180000,
            maxPrice: 180000,
            estimatedMinutes: 45,
            description: 'Vệ sinh lưới lọc, xịt rửa dàn lạnh, dàn nóng máy lạnh treo tường 1-1.5 HP',
            scopeDescription: 'Tháo rửa lưới lọc bụi, vỏ máy, xịt rửa dàn lạnh áp lực cao, kiểm tra quạt lồng sóc, xịt rửa dàn nóng và kiểm tra áp suất gas',
          },
          {
            code: 'VE_SINH_DIEU_HOA_2HP',
            name: 'Vệ sinh điều hòa treo tường 2–2.5 HP',
            slug: 've-sinh-dieu-hoa-2hp',
            pricingMode: 'fixed_price',
            unit: 'Máy',
            fixedPrice: 220000,
            basePrice: 220000,
            minPrice: 220000,
            maxPrice: 220000,
            estimatedMinutes: 60,
            description: 'Vệ sinh máy lạnh công suất 2-2.5 HP, xịt rửa dàn tản nhiệt và thông ống thoát nước',
            scopeDescription: 'Vệ sinh toàn diện dàn lạnh và dàn nóng điều hòa 2–2.5 HP, thông đường ống thoát nước ngưng chống chảy nước',
          },
          {
            code: 'VE_SINH_DIEU_HOA_AM_TRAN',
            name: 'Vệ sinh điều hòa âm trần',
            slug: 've-sinh-dieu-hoa-am-tran',
            pricingMode: 'fixed_price',
            unit: 'Máy',
            fixedPrice: 500000,
            basePrice: 500000,
            minPrice: 500000,
            maxPrice: 500000,
            estimatedMinutes: 90,
            description: 'Tháo mặt nạ, vệ sinh lưới lọc và dàn trao đổi nhiệt điều hòa cassette âm trần',
            scopeDescription: 'Bọc bạt bảo vệ, tháo mặt nạ panel, vệ sinh máng nước ngưng, rửa dàn tản nhiệt và kiểm tra bơm xả nước ngưng',
          },
          {
            code: 'VE_SINH_MAY_GIAT_CUA_TREN_LE9',
            name: 'Vệ sinh cửa trên ≤ 9kg',
            slug: 've-sinh-may-giat-cua-tren-le9',
            pricingMode: 'fixed_price',
            unit: 'Máy',
            fixedPrice: 350000,
            basePrice: 350000,
            minPrice: 350000,
            maxPrice: 350000,
            estimatedMinutes: 60,
            description: 'Tháo lồng máy giặt cửa trên ≤ 9kg, tẩy cặn bẩn, vệ sinh mâm giặt và khử khuẩn',
            scopeDescription: 'Tháo rời mâm giặt và lồng giặt kim loại, dùng máy xịt rửa áp lực cao tẩy sạch mảng bám xà phòng, cặn canxi và nấm mốc',
          },
          {
            code: 'VE_SINH_MAY_GIAT_CUA_TREN_GT9',
            name: 'Vệ sinh cửa trên > 9kg',
            slug: 've-sinh-may-giat-cua-tren-gt9',
            pricingMode: 'fixed_price',
            unit: 'Máy',
            fixedPrice: 450000,
            basePrice: 450000,
            minPrice: 450000,
            maxPrice: 450000,
            estimatedMinutes: 75,
            description: 'Tháo lồng máy giặt cửa trên dung tích lớn > 9kg, vệ sinh xịt áp lực cao',
            scopeDescription: 'Tháo rời toàn bộ lồng giặt dung tích trên 9kg, tẩy sạch cặn bám sâu và bôi mỡ bảo dưỡng trục quay',
          },
          {
            code: 'VE_SINH_MAY_GIAT_CUA_NGANG_LE9',
            name: 'Vệ sinh cửa ngang ≤ 9kg',
            slug: 've-sinh-may-giat-cua-ngang-le9',
            pricingMode: 'fixed_price',
            unit: 'Máy',
            fixedPrice: 550000,
            basePrice: 550000,
            minPrice: 550000,
            maxPrice: 550000,
            estimatedMinutes: 90,
            description: 'Tháo rời lồng máy giặt cửa ngang ≤ 9kg, vệ sinh gioăng cao su, khử nấm mốc',
            scopeDescription: 'Tháo mặt trước, bộ giảm chấn và lồng giặt ngang, tẩy sạch cặn bẩn lồng trong ngoài, vệ sinh gioăng cao su chống hôi',
          },
          {
            code: 'VE_SINH_MAY_GIAT_CUA_NGANG_GT9',
            name: 'Vệ sinh cửa ngang > 9kg',
            slug: 've-sinh-may-giat-cua-ngang-gt9',
            pricingMode: 'fixed_price',
            unit: 'Máy',
            fixedPrice: 650000,
            basePrice: 650000,
            minPrice: 650000,
            maxPrice: 650000,
            estimatedMinutes: 105,
            description: 'Vệ sinh chuyên sâu máy giặt cửa trước > 9kg, xử lý cặn báng xà phòng và lồng giặt',
            scopeDescription: 'Tháo lồng máy giặt ngang khối lượng giặt lớn, tẩy sạch cặn vôi hoá, khử trùng tia cực tím hoặc hoá chất chuyên dụng',
          },
          {
            code: 'VE_SINH_MAY_SAY',
            name: 'Vệ sinh máy sấy gia đình',
            slug: 've-sinh-may-say',
            pricingMode: 'fixed_price',
            unit: 'Máy',
            fixedPrice: 350000,
            basePrice: 350000,
            minPrice: 350000,
            maxPrice: 350000,
            estimatedMinutes: 45,
            description: 'Vệ sinh bộ lọc xơ vải, ống thông hơi và buồng sấy nhiệt',
            scopeDescription: 'Hút bụi xơ vải tích tụ quanh lồng sấy và mayxo đốt nóng, thông đường gió thải chống nguy cơ chập cháy nhiệt',
          },
          {
            code: 'KIEM_TRA_CHAN_DOAN_THIET_BI',
            name: 'Kiểm tra/chẩn đoán thiết bị tại nhà',
            slug: 'kiem-tra-chan-doan-thiet-bi',
            pricingMode: 'fixed_price',
            unit: 'Lần',
            fixedPrice: 100000,
            basePrice: 100000,
            minPrice: 100000,
            maxPrice: 100000,
            estimatedMinutes: 30,
            description: 'Kiểm tra, đo đạc thông số kỹ thuật và chẩn đoán lỗi thiết bị tận nơi',
            scopeDescription: 'Kỹ thuật viên có mặt tại nhà, dùng đồng hồ chuyên dụng kiểm tra nguồn điện, rơ le, bo mạch và tư vấn giải pháp',
          },
          // ── Inspection Required Services ──
          {
            code: 'SUA_DIEU_HOA',
            name: 'Sửa điều hòa không mát / chảy nước',
            slug: 'sua-dieu-hoa',
            pricingMode: 'inspection_required',
            unit: 'Máy',
            fixedPrice: null,
            basePrice: 150000,
            minPrice: 100000,
            maxPrice: 600000,
            estimatedMinutes: 60,
            description: 'Kiểm tra gas, quạt dàn nóng/lạnh, khắc phục lỗi chảy nước',
            scopeDescription: 'Khảo sát và chẩn đoán thực tế, báo giá sau khi kiểm tra nguyên nhân xì gas hoặc hỏng bo mạch',
          },
          {
            code: 'SUA_TU_LANH',
            name: 'Sửa tủ lạnh không đông đá / kêu to',
            slug: 'sua-tu-lanh',
            pricingMode: 'inspection_required',
            unit: 'Tủ',
            fixedPrice: null,
            basePrice: 180000,
            minPrice: 120000,
            maxPrice: 700000,
            estimatedMinutes: 60,
            description: 'Kiểm tra block, cảm biến nhiệt, quạt gió và zoăng cửa',
            scopeDescription: 'Kiểm tra hệ thống làm lạnh, sò nóng/lạnh, timer xả đá hoặc máy nén inverter',
          },
          {
            code: 'SUA_MAY_GIAT',
            name: 'Sửa máy giặt rung lắc / không vắt',
            slug: 'sua-may-giat',
            pricingMode: 'inspection_required',
            unit: 'Máy',
            fixedPrice: null,
            basePrice: 180000,
            minPrice: 120000,
            maxPrice: 650000,
            estimatedMinutes: 60,
            description: 'Xử lý lỗi cấp/xả nước, cân bằng lồng giặt, thay chổi than',
            scopeDescription: 'Khảo sát tiếng ồn bất thường, lỗi bo điều khiển, phuộc nhún lò xo hoặc van cấp xả',
          },
        ],
      },
      {
        code: 'DIEN_NUOC',
        name: 'Điện & Nước',
        slug: 'dien-nuoc',
        iconKey: 'Zap',
        sortOrder: 2,
        description: 'Khắc phục sự cố chập điện, rò rỉ nước, thay thế thiết bị vệ sinh',
        services: [
          // ── Fixed Price Services (Table 8.3.1) ──
          {
            code: 'VE_SINH_BINH_NONG_LANH',
            name: 'Vệ sinh/bảo dưỡng bình nóng lạnh',
            slug: 've-sinh-binh-nong-lanh',
            pricingMode: 'fixed_price',
            unit: 'Bình',
            fixedPrice: 250000,
            basePrice: 250000,
            minPrice: 250000,
            maxPrice: 250000,
            estimatedMinutes: 45,
            description: 'Súc rửa ruột bình nước nóng, kiểm tra và thay thanh magie chống ăn mòn',
            scopeDescription: 'Tháo xả cặn vôi ruột bình, đánh sạch thanh đốt mayxo, kiểm tra rơle nhiệt chống giật ELCB',
          },
          {
            code: 'THAY_CONG_TAC_DIEN',
            name: 'Thay công tắc điện - tiền công',
            slug: 'thay-cong-tac-dien',
            pricingMode: 'fixed_price',
            unit: 'Cái',
            fixedPrice: 100000,
            basePrice: 100000,
            minPrice: 100000,
            maxPrice: 100000,
            estimatedMinutes: 30,
            description: 'Tiền công tháo và thay thế mặt công tắc điện chuẩn an toàn',
            scopeDescription: 'Tháo mặt hạt công tắc hỏng cũ, đấu nối dây nguồn an toàn và lắp mặt công tắc mới',
          },
          {
            code: 'THAY_O_CAM_DIEN',
            name: 'Thay ổ cắm điện - tiền công',
            slug: 'thay-o-cam-dien',
            pricingMode: 'fixed_price',
            unit: 'Cái',
            fixedPrice: 100000,
            basePrice: 100000,
            minPrice: 100000,
            maxPrice: 100000,
            estimatedMinutes: 30,
            description: 'Tiền công thay ổ cắm điện âm tường hoặc gắn nổi',
            scopeDescription: 'Tháo ổ cắm cũ, kiểm tra tiếp xúc dây đồng, lắp ổ cắm chống giật âm tường hoặc nổi',
          },
          {
            code: 'LAP_DEN_TRAN_CO_BAN',
            name: 'Lắp đèn trần cơ bản - tiền công',
            slug: 'lap-den-tran-co-ban',
            pricingMode: 'fixed_price',
            unit: 'Cái',
            fixedPrice: 120000,
            basePrice: 120000,
            minPrice: 120000,
            maxPrice: 120000,
            estimatedMinutes: 30,
            description: 'Khoan gắn đèn ốp trần, đèn tuýp led hoặc đèn downlight cơ bản',
            scopeDescription: 'Đo khoét lỗ hoặc khoan tắc kê trần thạch cao/bê tông, đấu tăng phô nguồn và thử sáng',
          },
          {
            code: 'LAP_QUAT_TREO_TUONG',
            name: 'Lắp quạt treo tường - tiền công',
            slug: 'lap-quat-treo-tuong',
            pricingMode: 'fixed_price',
            unit: 'Cái',
            fixedPrice: 150000,
            basePrice: 150000,
            minPrice: 150000,
            maxPrice: 150000,
            estimatedMinutes: 45,
            description: 'Khoan bắt giá treo, lắp quạt và đấu nối nguồn điện gia đình',
            scopeDescription: 'Khoan gia cố pát sắt treo tường chịu lực, lắp ráp thân cánh lồng quạt và đi dây nguồn',
          },
          {
            code: 'LAP_QUAT_TRAN_CO_BAN',
            name: 'Lắp quạt trần cơ bản - tiền công',
            slug: 'lap-quat-tran-co-ban',
            pricingMode: 'fixed_price',
            unit: 'Cái',
            fixedPrice: 250000,
            basePrice: 250000,
            minPrice: 250000,
            maxPrice: 250000,
            estimatedMinutes: 60,
            description: 'Lắp ráp móc treo, ti quạt, cân cánh quạt trần chuẩn kỹ thuật',
            scopeDescription: 'Bắt móc treo bê tông chắc chắn, lắp ti và motor, cân chỉnh cánh chống rung lắc và đấu công tắc điều khiển',
          },
          {
            code: 'LAP_TV_GIA_TREO',
            name: 'Lắp TV lên giá treo có sẵn',
            slug: 'lap-tv-gia-treo',
            pricingMode: 'fixed_price',
            unit: 'TV',
            fixedPrice: 100000,
            basePrice: 100000,
            minPrice: 100000,
            maxPrice: 100000,
            estimatedMinutes: 45,
            description: 'Bắt vít TV vào khung giá treo có sẵn, cân chỉnh góc nhìn an toàn',
            scopeDescription: 'Gắn thanh ray treo lưng TV, nâng lắp vào khung tường sẵn có, siết chốt khoá an toàn',
          },
          {
            code: 'THAY_VOI_NUOC',
            name: 'Thay vòi nước - tiền công',
            slug: 'thay-voi-nuoc',
            pricingMode: 'fixed_price',
            unit: 'Cái',
            fixedPrice: 120000,
            basePrice: 120000,
            minPrice: 120000,
            maxPrice: 120000,
            estimatedMinutes: 30,
            description: 'Tiền công tháo cũ và gắn vòi nước rửa tay, vòi xả chậu giặt',
            scopeDescription: 'Khoá van tổng, tháo chân vòi cũ bị rỉ gãy, quấn băng tan chống thấm và siết vòi mới',
          },
          {
            code: 'THAY_VOI_SEN',
            name: 'Thay vòi sen - tiền công',
            slug: 'thay-voi-sen',
            pricingMode: 'fixed_price',
            unit: 'Bộ',
            fixedPrice: 150000,
            basePrice: 150000,
            minPrice: 150000,
            maxPrice: 150000,
            estimatedMinutes: 45,
            description: 'Tiền công lắp đặt củ sen tắm nóng lạnh, dây sen và bát sen',
            scopeDescription: 'Tháo chân sen cũ, cân chỉnh khoảng cách chân chữ Z nóng lạnh, lắp củ sen và cài giá đỡ bát sen',
          },
          {
            code: 'THAY_SIPHON_LAVABO',
            name: 'Thay siphon/chống rò lavabo - tiền công',
            slug: 'thay-siphon-lavabo',
            pricingMode: 'fixed_price',
            unit: 'Bộ',
            fixedPrice: 150000,
            basePrice: 150000,
            minPrice: 150000,
            maxPrice: 150000,
            estimatedMinutes: 45,
            description: 'Thay cụm siphon ruột gà/ống cứng xả đáy bồn lavabo chống rò rỉ',
            scopeDescription: 'Tháo cổ xả rò rỉ nước, vệ sinh đáy bồn, lắp cụm siphon mới có bẫy ngăn mùi và gioăng cao su kín',
          },
          // ── Inspection Required Services ──
          {
            code: 'SUA_CHAP_DIEN',
            name: 'Sửa chập điện âm tường / nhảy Aptomat',
            slug: 'sua-chap-dien',
            pricingMode: 'inspection_required',
            unit: 'Lần',
            fixedPrice: null,
            basePrice: 200000,
            minPrice: 150000,
            maxPrice: 800000,
            estimatedMinutes: 90,
            description: 'Dò tìm điểm chập ngầm, đấu nối lại dây nguồn an toàn tiêu chuẩn',
            scopeDescription: 'Dùng thiết bị dò dây âm tường, tách tải từng nhánh aptomat để cô lập và xử lý sự cố',
          },
          {
            code: 'SUA_RO_RI_NUOC',
            name: 'Sửa rò rỉ đường ống nước / bục vỡ',
            slug: 'sua-ro-ri-nuoc',
            pricingMode: 'inspection_required',
            unit: 'Lần',
            fixedPrice: null,
            basePrice: 150000,
            minPrice: 100000,
            maxPrice: 500000,
            estimatedMinutes: 60,
            description: 'Xử lý thấm dột, thay ống PPR hàn nhiệt, chống rò rỉ triệt để',
            scopeDescription: 'Đo áp lực kiểm tra rò rỉ, đục cắt vị trí bục vỡ và hàn nối ống nhiệt chịu áp',
          },
        ],
      },
      {
        code: 'BEP_GIA_DUNG',
        name: 'Thiết bị nhà bếp',
        slug: 'thiet-bi-bep',
        iconKey: 'Utensils',
        sortOrder: 3,
        description: 'Sửa chữa bếp từ, máy hút mùi, máy rửa chén gia đình',
        services: [
          // ── Fixed Price Services (Table 8.3.1) ──
          {
            code: 'LAP_MAY_LOC_NUOC',
            name: 'Lắp máy lọc nước cơ bản',
            slug: 'lap-may-loc-nuoc',
            pricingMode: 'fixed_price',
            unit: 'Máy',
            fixedPrice: 250000,
            basePrice: 250000,
            minPrice: 250000,
            maxPrice: 250000,
            estimatedMinutes: 60,
            description: 'Khoan đấu nối đường nước cấp, đường xả thải và lắp đặt máy lọc nước RO/Nano',
            scopeDescription: 'Tê chia nguồn cấp nước ngầm, đấu nối các cốc lọc thô, màng RO, đấu van bình áp và xả rửa lõi đầu lọc',
          },
          // ── Inspection Required Services ──
          {
            code: 'SUA_BEP_TU',
            name: 'Sửa bếp từ báo lỗi E / không nhận nồi',
            slug: 'sua-bep-tu',
            pricingMode: 'inspection_required',
            unit: 'Bếp',
            fixedPrice: null,
            basePrice: 150000,
            minPrice: 120000,
            maxPrice: 600000,
            estimatedMinutes: 60,
            description: 'Kiểm tra mâm từ, sò công suất IGBT, cầu chì nhiệt bếp từ đôi/đơn',
            scopeDescription: 'Khảo sát lỗi mạch cảm ứng, công suất nguồn hoặc thay diode chỉnh lưu',
          },
          {
            code: 'SUA_MAY_RUA_CHEN',
            name: 'Sửa máy rửa bát không sạch / tràn nước',
            slug: 'sua-may-rua-chen',
            pricingMode: 'inspection_required',
            unit: 'Máy',
            fixedPrice: null,
            basePrice: 200000,
            minPrice: 150000,
            maxPrice: 800000,
            estimatedMinutes: 75,
            description: 'Khắc phục bơm áp lực, vệ sinh tay phun, cảm biến mức nước',
            scopeDescription: 'Chẩn đoán động cơ tuần hoàn, van cấp nước hoặc phao chống tràn',
          },
        ],
      },
      {
        code: 'KHOA_CUA',
        name: 'Cửa & Khóa thông minh',
        slug: 'khoa-cua',
        iconKey: 'Lock',
        sortOrder: 4,
        description: 'Lắp đặt, cài đặt và sửa khóa cửa vân tay, khóa điện tử, tay nắm',
        services: [
          {
            code: 'SUA_KHOA_THONG_MINH',
            name: 'Sửa khóa cửa vân tay / thẻ từ',
            slug: 'sua-khoa-thong-minh',
            pricingMode: 'inspection_required',
            unit: 'Bộ',
            fixedPrice: null,
            basePrice: 200000,
            minPrice: 150000,
            maxPrice: 700000,
            estimatedMinutes: 60,
            description: 'Cài đặt lại firmware, thay motor chốt khóa, xử lý lỗi vân tay',
            scopeDescription: 'Tháo ổ khoá, kiểm tra mạch điều khiển, motor gạt chốt hoặc bàn phím số',
          },
          {
            code: 'MO_KHOA_KHAN_CAP',
            name: 'Mở khóa cửa khẩn cấp 24/7',
            slug: 'mo-khoa-khan-cap',
            pricingMode: 'inspection_required',
            unit: 'Lần',
            fixedPrice: null,
            basePrice: 150000,
            minPrice: 120000,
            maxPrice: 400000,
            estimatedMinutes: 30,
            description: 'Thợ có mặt trong 30 phút mở khóa không hư hại ổ khóa',
            scopeDescription: 'Sử dụng bộ đồ nghề chuyên dụng để mở ổ khoá cơ hoặc kích nguồn khẩn cấp cho khoá điện tử hết pin',
          },
        ],
      },
    ];

    const allInsertedServiceIds: { id: string; code: string; pricingMode: string; basePrice: number }[] = [];

    for (const cat of categories) {
      // Upsert category
      let categoryId: string;
      const existingCat = await queryRunner.query(
        `SELECT "id" FROM "service_categories" WHERE "code" = $1`,
        [cat.code],
      );

      if (existingCat.length > 0) {
        categoryId = existingCat[0].id;
        await queryRunner.query(
          `UPDATE "service_categories"
           SET "name" = $1, "slug" = $2, "icon_key" = $3, "sort_order" = $4, "description" = $5, "is_active" = true, "updated_at" = now()
           WHERE "id" = $6`,
          [cat.name, cat.slug, cat.iconKey, cat.sortOrder, cat.description, categoryId],
        );
      } else {
        const inserted = await queryRunner.query(
          `INSERT INTO "service_categories" ("name", "code", "slug", "icon_key", "sort_order", "description", "is_active")
           VALUES ($1, $2, $3, $4, $5, $6, true)
           RETURNING "id"`,
          [cat.name, cat.code, cat.slug, cat.iconKey, cat.sortOrder, cat.description],
        );
        categoryId = inserted[0].id;
      }

      // Upsert services with pricingMode, unit, fixedPrice, scopeDescription
      for (const svc of cat.services) {
        const existingSvc = await queryRunner.query(
          `SELECT "id" FROM "services" WHERE "code" = $1`,
          [svc.code],
        );

        let svcId: string;
        if (existingSvc.length > 0) {
          svcId = existingSvc[0].id;
          await queryRunner.query(
            `UPDATE "services"
             SET "category_id" = $1, "name" = $2, "slug" = $3, "base_price" = $4, "min_price" = $5, "max_price" = $6, "estimated_minutes" = $7, "description" = $8,
                 "pricing_mode" = $9, "unit" = $10, "fixed_price" = $11, "scope_description" = $12, "is_active" = true, "updated_at" = now()
             WHERE "id" = $13`,
            [
              categoryId,
              svc.name,
              svc.slug,
              svc.basePrice,
              svc.minPrice,
              svc.maxPrice,
              svc.estimatedMinutes,
              svc.description,
              svc.pricingMode,
              svc.unit,
              svc.fixedPrice,
              svc.scopeDescription,
              svcId,
            ],
          );
        } else {
          const ins = await queryRunner.query(
            `INSERT INTO "services" ("category_id", "name", "code", "slug", "base_price", "min_price", "max_price", "estimated_minutes", "description", "pricing_mode", "unit", "fixed_price", "scope_description", "is_active")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true)
             RETURNING "id"`,
            [
              categoryId,
              svc.name,
              svc.code,
              svc.slug,
              svc.basePrice,
              svc.minPrice,
              svc.maxPrice,
              svc.estimatedMinutes,
              svc.description,
              svc.pricingMode,
              svc.unit,
              svc.fixedPrice,
              svc.scopeDescription,
            ],
          );
          svcId = ins[0].id;
        }

        allInsertedServiceIds.push({
          id: svcId,
          code: svc.code,
          pricingMode: svc.pricingMode,
          basePrice: svc.basePrice,
        });
      }
    }

    // 2. Attach demo technician skills with listed labor prices
    const techProfiles = await queryRunner.query(
      `SELECT "id" FROM "technician_profiles"`,
    );

    for (const profile of techProfiles) {
      for (const svc of allInsertedServiceIds) {
        await queryRunner.query(
          `INSERT INTO "technician_skills" ("technician_id", "service_id", "skill_level", "is_active", "listed_labor_price", "typical_warranty_days")
           VALUES ($1, $2, 'EXPERT', true, $3, 30)
           ON CONFLICT DO NOTHING`,
          [
            profile.id,
            svc.id,
            svc.pricingMode === 'inspection_required' ? svc.basePrice : null,
          ],
        );
      }
    }

    // 3. Service Areas
    const serviceAreas = [
      // Hà Nội (01)
      { provinceCode: '01', provinceName: 'Hà Nội', districtCode: '001', districtName: 'Quận Ba Đình' },
      { provinceCode: '01', provinceName: 'Hà Nội', districtCode: '002', districtName: 'Quận Hoàn Kiếm' },
      { provinceCode: '01', provinceName: 'Hà Nội', districtCode: '003', districtName: 'Quận Tây Hồ' },
      { provinceCode: '01', provinceName: 'Hà Nội', districtCode: '004', districtName: 'Quận Long Biên' },
      { provinceCode: '01', provinceName: 'Hà Nội', districtCode: '005', districtName: 'Quận Cầu Giấy' },
      { provinceCode: '01', provinceName: 'Hà Nội', districtCode: '006', districtName: 'Quận Đống Đa' },
      { provinceCode: '01', provinceName: 'Hà Nội', districtCode: '007', districtName: 'Quận Hai Bà Trưng' },
      { provinceCode: '01', provinceName: 'Hà Nội', districtCode: '008', districtName: 'Quận Hoàng Mai' },
      { provinceCode: '01', provinceName: 'Hà Nội', districtCode: '009', districtName: 'Quận Thanh Xuân' },
      { provinceCode: '01', provinceName: 'Hà Nội', districtCode: '016', districtName: 'Quận Nam Từ Liêm' },
      { provinceCode: '01', provinceName: 'Hà Nội', districtCode: '019', districtName: 'Quận Bắc Từ Liêm' },
      { provinceCode: '01', provinceName: 'Hà Nội', districtCode: '021', districtName: 'Quận Hà Đông' },
      // TP. Hồ Chí Minh (79)
      { provinceCode: '79', provinceName: 'TP. Hồ Chí Minh', districtCode: '760', districtName: 'Quận 1' },
      { provinceCode: '79', provinceName: 'TP. Hồ Chí Minh', districtCode: '761', districtName: 'Quận 12' },
      { provinceCode: '79', provinceName: 'TP. Hồ Chí Minh', districtCode: '764', districtName: 'Quận Gò Vấp' },
      { provinceCode: '79', provinceName: 'TP. Hồ Chí Minh', districtCode: '765', districtName: 'Quận Bình Thạnh' },
      { provinceCode: '79', provinceName: 'TP. Hồ Chí Minh', districtCode: '766', districtName: 'Quận Tân Bình' },
      { provinceCode: '79', provinceName: 'TP. Hồ Chí Minh', districtCode: '767', districtName: 'Quận Tân Phú' },
      { provinceCode: '79', provinceName: 'TP. Hồ Chí Minh', districtCode: '768', districtName: 'Quận Phú Nhuận' },
      { provinceCode: '79', provinceName: 'TP. Hồ Chí Minh', districtCode: '769', districtName: 'Thành phố Thủ Đức' },
      { provinceCode: '79', provinceName: 'TP. Hồ Chí Minh', districtCode: '770', districtName: 'Quận 3' },
      { provinceCode: '79', provinceName: 'TP. Hồ Chí Minh', districtCode: '771', districtName: 'Quận 10' },
      { provinceCode: '79', provinceName: 'TP. Hồ Chí Minh', districtCode: '772', districtName: 'Quận 11' },
      { provinceCode: '79', provinceName: 'TP. Hồ Chí Minh', districtCode: '773', districtName: 'Quận 4' },
      { provinceCode: '79', provinceName: 'TP. Hồ Chí Minh', districtCode: '774', districtName: 'Quận 5' },
      { provinceCode: '79', provinceName: 'TP. Hồ Chí Minh', districtCode: '775', districtName: 'Quận 6' },
      { provinceCode: '79', provinceName: 'TP. Hồ Chí Minh', districtCode: '776', districtName: 'Quận 8' },
      { provinceCode: '79', provinceName: 'TP. Hồ Chí Minh', districtCode: '777', districtName: 'Quận Bình Tân' },
      { provinceCode: '79', provinceName: 'TP. Hồ Chí Minh', districtCode: '778', districtName: 'Quận 7' },
    ];

    for (const area of serviceAreas) {
      await queryRunner.query(
        `INSERT INTO "service_areas" ("province_code", "province_name", "district_code", "district_name", "is_active")
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT ("province_code", "district_code") DO UPDATE
         SET "province_name" = EXCLUDED."province_name",
             "district_name" = EXCLUDED."district_name",
             "is_active" = true,
             "updated_at" = now()`,
        [area.provinceCode, area.provinceName, area.districtCode, area.districtName],
      );
    }

    await queryRunner.commitTransaction();
    // eslint-disable-next-line no-console
    console.log(`✅ Seeded ${categories.length} categories, ${allInsertedServiceIds.length} services (including 20 FIXED_PRICE from Spec v1.2 Table 8.3.1), and ${serviceAreas.length} service areas`);
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}

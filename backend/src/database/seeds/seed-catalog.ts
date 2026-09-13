// src/database/seeds/seed-catalog.ts
import { DataSource } from 'typeorm';

export async function seedCatalog(dataSource: DataSource): Promise<void> {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 1. Categories
    const categories = [
      {
        code: 'DIEN_LANH',
        name: 'Điện lạnh',
        slug: 'dien-lanh',
        iconKey: 'Snowflake',
        sortOrder: 1,
        description: 'Sửa chữa và bảo dưỡng điều hòa, tủ lạnh, máy giặt tận nhà',
        services: [
          {
            code: 'SUA_DIEU_HOA',
            name: 'Sửa điều hòa không mát / chảy nước',
            slug: 'sua-dieu-hoa',
            basePrice: 150000,
            minPrice: 100000,
            maxPrice: 600000,
            estimatedMinutes: 60,
            description: 'Kiểm tra gas, quạt dàn nóng/lạnh, khắc phục lỗi chảy nước',
          },
          {
            code: 'VE_SINH_DIEU_HOA',
            name: 'Vệ sinh & nạp gas điều hòa',
            slug: 've-sinh-dieu-hoa',
            basePrice: 200000,
            minPrice: 150000,
            maxPrice: 400000,
            estimatedMinutes: 45,
            description: 'Bảo dưỡng lưới lọc, dàn tản nhiệt và đo áp suất gas R32/R410A',
          },
          {
            code: 'SUA_TU_LANH',
            name: 'Sửa tủ lạnh không đông đá / kêu to',
            slug: 'sua-tu-lanh',
            basePrice: 180000,
            minPrice: 120000,
            maxPrice: 700000,
            estimatedMinutes: 60,
            description: 'Kiểm tra block, cảm biến nhiệt, quạt gió và zoăng cửa',
          },
          {
            code: 'SUA_MAY_GIAT',
            name: 'Sửa máy giặt rung lắc / không vắt',
            slug: 'sua-may-giat',
            basePrice: 180000,
            minPrice: 120000,
            maxPrice: 650000,
            estimatedMinutes: 60,
            description: 'Xử lý lỗi cấp/xả nước, cân bằng lồng giặt, thay chổi than',
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
          {
            code: 'SUA_CHAP_DIEN',
            name: 'Sửa chập điện âm tường / nhảy Aptomat',
            slug: 'sua-chap-dien',
            basePrice: 200000,
            minPrice: 150000,
            maxPrice: 800000,
            estimatedMinutes: 90,
            description: 'Dò tìm điểm chập ngầm, đấu nối lại dây nguồn an toàn tiêu chuẩn',
          },
          {
            code: 'SUA_RO_RI_NUOC',
            name: 'Sửa rò rỉ đường ống nước / bục vỡ',
            slug: 'sua-ro-ri-nuoc',
            basePrice: 150000,
            minPrice: 100000,
            maxPrice: 500000,
            estimatedMinutes: 60,
            description: 'Xử lý thấm dột, thay ống PPR hàn nhiệt, chống rò rỉ triệt để',
          },
          {
            code: 'THAY_THIET_BI_VE_SINH',
            name: 'Lắp đặt, thay vòi sen, lavabo, bồn cầu',
            slug: 'thay-thiet-bi-ve-sinh',
            basePrice: 120000,
            minPrice: 100000,
            maxPrice: 400000,
            estimatedMinutes: 45,
            description: 'Lắp thiết bị phòng tắm, thay phao bồn cầu, xịt vệ sinh',
          },
          {
            code: 'LAP_QUAT_DEN',
            name: 'Lắp đặt quạt trần, đèn trang trí, ổ cắm',
            slug: 'lap-quat-den',
            basePrice: 100000,
            minPrice: 80000,
            maxPrice: 300000,
            estimatedMinutes: 45,
            description: 'Khoan bắt tắc kê gia cố chắc chắn, đi dây gọn gàng thẩm mỹ',
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
          {
            code: 'SUA_BEP_TU',
            name: 'Sửa bếp từ báo lỗi E / không nhận nồi',
            slug: 'sua-bep-tu',
            basePrice: 150000,
            minPrice: 120000,
            maxPrice: 600000,
            estimatedMinutes: 60,
            description: 'Kiểm tra mâm từ, sò công suất IGBT, cầu chì nhiệt bếp từ đôi/đơn',
          },
          {
            code: 'SUA_MAY_HUT_MUI',
            name: 'Vệ sinh & sửa motor máy hút mùi',
            slug: 'sua-may-hut-mui',
            basePrice: 150000,
            minPrice: 100000,
            maxPrice: 450000,
            estimatedMinutes: 45,
            description: 'Tẩy dầu mỡ tấm lọc than hoạt tính, thay tụ kích motor hút khói',
          },
          {
            code: 'SUA_MAY_RUA_CHEN',
            name: 'Sửa máy rửa bát không sạch / tràn nước',
            slug: 'sua-may-rua-chen',
            basePrice: 200000,
            minPrice: 150000,
            maxPrice: 800000,
            estimatedMinutes: 75,
            description: 'Khắc phục bơm áp lực, vệ sinh tay phun, cảm biến mức nước',
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
            basePrice: 200000,
            minPrice: 150000,
            maxPrice: 700000,
            estimatedMinutes: 60,
            description: 'Cài đặt lại firmware, thay motor chốt khóa, xử lý lỗi vân tay',
          },
          {
            code: 'MO_KHOA_KHAN_CAP',
            name: 'Mở khóa cửa khẩn cấp 24/7',
            slug: 'mo-khoa-khan-cap',
            basePrice: 150000,
            minPrice: 120000,
            maxPrice: 400000,
            estimatedMinutes: 30,
            description: 'Thợ có mặt trong 30 phút mở khóa không hư hại ổ khóa',
          },
        ],
      },
    ];

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

      // Upsert services
      for (const svc of cat.services) {
        const existingSvc = await queryRunner.query(
          `SELECT "id" FROM "services" WHERE "code" = $1`,
          [svc.code],
        );

        if (existingSvc.length > 0) {
          await queryRunner.query(
            `UPDATE "services"
             SET "category_id" = $1, "name" = $2, "slug" = $3, "base_price" = $4, "min_price" = $5, "max_price" = $6, "estimated_minutes" = $7, "description" = $8, "is_active" = true, "updated_at" = now()
             WHERE "id" = $9`,
            [
              categoryId,
              svc.name,
              svc.slug,
              svc.basePrice,
              svc.minPrice,
              svc.maxPrice,
              svc.estimatedMinutes,
              svc.description,
              existingSvc[0].id,
            ],
          );
        } else {
          await queryRunner.query(
            `INSERT INTO "services" ("category_id", "name", "code", "slug", "base_price", "min_price", "max_price", "estimated_minutes", "description", "is_active")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)`,
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
            ],
          );
        }
      }
    }

    // 2. Service Areas
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
    console.log(`✅ Seeded ${categories.length} categories with services and ${serviceAreas.length} service areas`);
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}

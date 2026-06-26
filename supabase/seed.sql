-- =============================================================================
-- Goldstar Official Store — seed data
-- Run AFTER schema.sql. Re-runnable: upserts on slug.
-- =============================================================================

-- image_path holds an absolute URL to an open-source (Creative Commons) photo
-- served by loremflickr.com; ?lock= pins a stable image per category.
insert into public.categories (slug, name, sort_order, image_path) values
  ('data-cable',   'Data Cable',     1, 'https://loremflickr.com/200/200/usb,cable?lock=110'),
  ('adaptor',      'Adaptor',        2, 'https://loremflickr.com/200/200/power,adapter?lock=120'),
  ('charger',      'Charger',        3, 'https://loremflickr.com/200/200/charger?lock=130'),
  ('earphone',     'Earphone',       4, 'https://loremflickr.com/200/200/earphone?lock=140'),
  ('otg-splitter', 'OTG & Splitter', 5, 'https://loremflickr.com/200/200/usb,adapter?lock=150'),
  ('nas-storage',  'NAS Storage',    6, 'https://loremflickr.com/200/200/server,storage?lock=160')
on conflict (slug) do update set
  name       = excluded.name,
  sort_order = excluded.sort_order,
  image_path = excluded.image_path;

insert into public.brands (slug, name) values
  ('ugreen', 'UGREEN'),
  ('baseus', 'Baseus'),
  ('anker',  'Anker')
on conflict (slug) do update set name = excluded.name;

-- Products (category_id / brand_id resolved by slug)
-- image_path holds an absolute URL to an open-source (Creative Commons) photo
-- served by loremflickr.com. The ?lock= param pins a stable image per product.
-- productImageUrl() passes absolute URLs through; bucket paths still work too.
insert into public.products
  (slug, name, category_id, brand_id, price, old_price, stock, rating, sold, description, highlights, image_path, image_tag)
values
  (
    'adaptor-charger-65w-gan',
    'Adaptor Charger 65W GaN Fast Charging',
    (select id from public.categories where slug = 'charger'),
    (select id from public.brands where slug = 'ugreen'),
    99000, 120000, 42, 4.8, 128,
    'Charger GaN 65W dengan 2 port USB-C + 1 USB-A. Mendukung fast charging untuk HP, tablet, dan laptop ringan. Ukuran ringkas, cocok untuk dibawa bepergian.',
    array['Output total 65W (PD 3.0 + PPS)','2× USB-C, 1× USB-A','Proteksi over-charge & panas'],
    'https://loremflickr.com/800/800/usb,charger?lock=10',
    'adaptor'
  ),
  (
    'travel-charger-universal',
    'Travel Charger Universal',
    (select id from public.categories where slug = 'charger'),
    (select id from public.brands where slug = 'baseus'),
    150000, null, 30, 4.7, 64,
    'Travel charger universal dengan colokan multi-region. Praktis untuk perjalanan ke luar negeri.',
    array['Multi-region plug','Output 2.4A','Ringkas & ringan'],
    'https://loremflickr.com/800/800/travel,charger?lock=20',
    'travel'
  ),
  (
    'wireless-charger-3-in-1',
    'Wireless Charger 3-in-1',
    (select id from public.categories where slug = 'charger'),
    (select id from public.brands where slug = 'anker'),
    150000, 175000, 18, 4.6, 51,
    'Dock pengisian nirkabel 3-in-1 untuk HP, smartwatch, dan earbuds sekaligus. Output stabil hingga 15W.',
    array['3 perangkat sekaligus','Output hingga 15W','Desktop dock'],
    'https://loremflickr.com/800/800/wireless,charger?lock=30',
    'wireless'
  ),
  (
    'adaptor-20w-pd-fast',
    'Adaptor 20W PD Fast',
    (select id from public.categories where slug = 'charger'),
    (select id from public.brands where slug = 'ugreen'),
    35000, null, 90, 4.8, 210,
    'Adaptor 20W Power Delivery, mungil dan cepat. Cocok untuk pengisian harian HP.',
    array['PD 20W','USB-C tunggal','Compact'],
    'https://loremflickr.com/800/800/power,adapter?lock=40',
    'adaptor 20w'
  ),
  (
    'car-charger-45w-dual',
    'Car Charger 45W Dual',
    (select id from public.categories where slug = 'charger'),
    (select id from public.brands where slug = 'baseus'),
    65000, null, 47, 4.5, 38,
    'Car charger dual port 45W untuk mengisi dua perangkat sekaligus di dalam mobil.',
    array['Dual port 45W','Indikator LED','Aluminium body'],
    'https://loremflickr.com/800/800/car,charger?lock=50',
    'car charger'
  ),
  (
    'multi-charger-300w-desktop',
    'Multi Charger 300W Desktop',
    (select id from public.categories where slug = 'charger'),
    (select id from public.brands where slug = 'anker'),
    850000, null, 0, 4.9, 12,
    'Charging station desktop 300W dengan banyak port untuk kebutuhan workstation.',
    array['Total 300W','Banyak port USB-C/A','Untuk workstation'],
    'https://loremflickr.com/800/800/charging,station?lock=60',
    'multi'
  ),
  (
    'data-cable-type-c-100w-1m',
    'Data Cable Type-C 100W 1m',
    (select id from public.categories where slug = 'data-cable'),
    (select id from public.brands where slug = 'ugreen'),
    45000, null, 120, 4.8, 320,
    'Kabel Type-C ke Type-C 100W dengan transfer data cepat. Panjang 1 meter, jaket nilon anti-kusut.',
    array['100W PD','Transfer data cepat','Jaket nilon 1m'],
    'https://loremflickr.com/800/800/usb,cable?lock=70',
    'kabel'
  ),
  (
    'nasync-4-bay-dx4800-plus',
    'NASYNC 4-BAY DX4800 PLUS',
    (select id from public.categories where slug = 'nas-storage'),
    null,
    9660000, null, 5, 5.0, 7,
    'Network Attached Storage 4-bay untuk backup dan penyimpanan terpusat skala kantor kecil.',
    array['4-bay','Backup terpusat','Akses jarak jauh'],
    'https://loremflickr.com/800/800/server,storage?lock=80',
    'NAS 4-bay'
  ),
  (
    'nasync-6-bay-dxp6800-pro',
    'NASYNC 6-BAY DXP6800 PRO',
    (select id from public.categories where slug = 'nas-storage'),
    null,
    13965000, null, 0, 5.0, 3,
    'NAS 6-bay kelas pro dengan performa tinggi untuk kebutuhan storage besar.',
    array['6-bay','Performa pro','Skala besar'],
    'https://loremflickr.com/800/800/nas,server?lock=90',
    'NAS 6-bay'
  )
on conflict (slug) do update set
  name        = excluded.name,
  category_id = excluded.category_id,
  brand_id    = excluded.brand_id,
  price       = excluded.price,
  old_price   = excluded.old_price,
  stock       = excluded.stock,
  rating      = excluded.rating,
  sold        = excluded.sold,
  description = excluded.description,
  highlights  = excluded.highlights,
  image_path  = excluded.image_path,
  image_tag   = excluded.image_tag;

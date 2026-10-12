<?php
/**
 * Script to import data from dalilukum.sql to SQLite
 * Run: php import_seed.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "Importing data...\n";

// Countries
$countries = [
    [1, 'سوريا', '+963', '🇸🇾', '9XXXXXXXX'],
    [2, 'المملكة العربية السعودية', '+966', '🇸🇦', '5XXXXXXXX'],
    [3, 'الكويت', '+965', '🇰🇼', 'X XXXXXXX'],
    [4, 'البحرين', '+973', '🇧🇭', '3XXXXXXX'],
    [5, 'عمان', '+968', '🇴🇲', '9XXXXXXX'],
    [6, 'قطر', '+974', '🇶🇦', 'XXXXXXXX'],
    [7, 'الأردن', '+962', '🇯🇴', '7XXXXXXXX'],
    [8, 'لبنان', '+961', '🇱🇧', '3XXXXXXX'],
    [9, 'مصر', '+20', '🇪🇬', '1XXXXXXXXX'],
    [10, 'تركيا', '+90', '🇹🇷', '5XXXXXXXXX'],
    [11, 'العراق', '+964', '🇮🇶', '7XXXXXXXXX'],
    [12, 'هولندا', '+31', '🇳🇱', '9XX XXX XXX'],
];
foreach ($countries as $c) {
    DB::table('countries')->insert([
        'id' => $c[0], 'name' => $c[1], 'phone_code' => $c[2],
        'flag' => $c[3], 'phone_mask' => $c[4]
    ]);
}
echo "✓ Countries imported (" . count($countries) . ")\n";

// Users
$users = [
    [1, '+963 933 111 222', 1, 1],
    [2, '+963 944 333 444', 1, 1],
];
foreach ($users as $u) {
    DB::table('users')->insert([
        'id' => $u[0], 'phone' => $u[1], 'country_id' => $u[2],
        'is_active' => $u[3], 'created_at' => '2026-06-20 09:37:22', 'updated_at' => '2026-06-20 09:37:22'
    ]);
}
echo "✓ Users imported (" . count($users) . ")\n";

// Default limits
DB::table('default_limits')->insert(['id' => 1, 'max_images' => 3, 'max_videos' => 1]);
echo "✓ Default limits imported\n";

// User limits
$userLimits = [
    [1, 10, 2],
    [2, 5, 1],
];
foreach ($userLimits as $ul) {
    DB::table('user_limits')->insert(['user_id' => $ul[0], 'max_images' => $ul[1], 'max_videos' => $ul[2]]);
}
echo "✓ User limits imported\n";

// Car brands
$brands = [
    [1, 'هيونداي', 'Hyundai', 438, 'hyundai.com', null, null],
    [2, 'كيا', 'Kia', 380, 'kia.com', null, null],
    [3, 'مرسيدس بنز', 'Mercedes-Benz', 142, 'mercedes-benz.com', null, null],
    [4, 'بي إم دبليو', 'BMW', 110, 'bmw.com', null, null],
    [5, 'أودي', 'Audi', 85, 'audi.com', null, null],
    [6, 'شيفروليه', 'Chevrolet', 63, 'chevrolet.com', null, null],
    [7, 'فولكس واجن', 'Volkswagen', 53, 'vw.com', null, null],
    [8, 'نيسان', 'Nissan', 50, 'nissanusa.com', null, null],
    [9, 'لاند روفر', 'Land Rover', 43, 'landrover.com', null, null],
    [10, 'فورد', 'Ford', 42, 'ford.com', null, null],
    [11, 'بيجو', 'Peugeot', 37, 'peugeot.com', null, null],
    [12, 'تويوتا', 'Toyota', 31, 'toyota.com', null, null],
    [13, 'ميتسوبيشي', 'Mitsubishi', 27, 'mitsubishimotors.com', null, null],
    [14, 'بي واي دي', 'BYD', 23, 'byd.com', null, null],
    [15, 'مازدا', 'Mazda', 23, 'mazda.com', null, null],
    [16, 'هوندا', 'Honda', 21, 'honda.com', null, null],
    [17, 'هينيسي', 'Hennessey', 17, 'hennesseyperformance.com', null, null],
    [18, 'كاديلاك', 'Cadillac', 16, 'cadillac.com', null, null],
    [19, 'دايو', 'Daewoo', 16, null, null, null],
    [20, 'رينو', 'Renault', 13, 'renault.com', null, null],
    [21, 'جيب', 'Jeep', 13, 'jeep.com', null, null],
    [22, 'شيري', 'Chery', 11, 'cheryinternational.com', null, null],
    [23, 'سكودا', 'Skoda', 11, 'skoda-auto.com', null, null],
    [24, 'سوزوكي', 'Suzuki', 11, 'globalsuzuki.com', null, null],
    [25, 'أوبل', 'Opel', 10, 'opel.com', null, null],
    [26, 'سانغ يونغ', 'SsangYong', 10, 'smotor.com', null, null],
    [27, 'جينيسيس', 'Genesis', 10, 'genesis.com', null, null],
    [28, 'دودج', 'Dodge', 9, 'dodge.com', null, null],
    [29, 'بورشه', 'Porsche', 9, 'porsche.com', null, null],
    [30, 'بروتون', 'Proton', 9, 'proton.com', null, null],
    [31, 'لادا', 'Lada', 8, 'lada.ru', null, null],
    [32, 'سوبارو', 'Subaru', 8, 'subaru.com', null, null],
    [33, 'إنفينيتي', 'Infiniti', 7, 'infiniti.com', null, null],
    [34, 'كرايسلر', 'Chrysler', 6, 'chrysler.com', null, null],
    [35, 'جيلي', 'Geely', 6, 'global.geely.com', null, null],
    [36, 'كاترين', 'Katren', 6, null, null, null],
    [37, 'لكزس', 'Lexus', 6, 'lexus.com', null, null],
    [38, 'سايبا', 'Saipa', 6, 'saipacorp.com', null, null],
    [39, 'بريليانس', 'Brilliance', 5, 'brillianceauto.com', null, null],
    [40, 'ستروين', 'Citroen', 5, 'citroen.com', null, null],
    [41, 'جاجوار', 'Jaguar', 5, 'jaguar.com', null, null],
    [42, 'فولفو', 'Volvo', 5, 'volvocars.com', null, null],
    [43, 'فورثينك', 'Forthing', 5, 'dongfeng-global.com', null, null],
    [44, 'داسيا', 'Dacia', 4, 'dacia.com', null, null],
    [45, 'دونغفينغ', 'Dongfeng', 4, 'dongfeng-global.com', null, null],
    [46, 'إم جي', 'MG', 3, 'mgmotor.me', null, null],
    [47, 'ميني', 'Mini', 3, 'miniusa.com', null, null],
    [48, 'جي إم سي', 'GMC', 3, 'gmc.com', null, null],
    [49, 'جيتور', 'Jetour', 3, 'jetourglobal.com', null, null],
    [50, 'دايهاتسو', 'Daihatsu', 2, 'daihatsu.com', null, null],
    [51, 'فيات', 'Fiat', 2, 'fiat.com', null, null],
    [52, 'ساب', 'Saab', 2, 'saab.com', null, null],
    [53, 'دي إف إس كيه', 'DFSK', 2, 'dfsk.com', null, null],
    [54, 'جريت ووال', 'Great Wall', 2, 'gwm-global.com', null, null],
    [55, 'جاك', 'JAC', 2, 'jacen.jac.com.cn', null, null],
    [56, 'زوتي', 'Zotye', 2, null, null, null],
    [57, 'شانجان', 'Changan', 2, 'globalchangan.com', null, null],
    [58, 'ألفا روميو', 'Alfa Romeo', 1, 'alfaromeousa.com', null, null],
    [59, 'بنتلي', 'Bentley', 1, 'bentleymotors.com', null, null],
    [60, 'تشانغه', 'Changhe', 1, null, null, null],
    [61, 'إيكو', 'Ikco', 1, null, null, null],
    [62, 'لينكولن', 'Lincoln', 1, 'lincoln.com', null, null],
    [63, 'مازيراتي', 'Maserati', 1, 'maserati.com', null, null],
    [64, 'مايباخ', 'Maybach', 1, 'mercedes-benz.com', null, null],
    [65, 'تسلا', 'Tesla', 1, 'tesla.com', null, null],
    [66, 'دي إف إم', 'DFM', 1, 'dongfeng-global.com', null, null],
    [67, 'هايما', 'Haima', 1, null, null, null],
    [68, 'سيات', 'Seat', 14, 'seat.com', null, null],
    [69, 'إيسوزو', 'Isuzu', 8, 'isuzu.com', null, null],
    [70, 'رولز رويس', 'Rolls-Royce', 10, 'rolls-roycemotorcars.com', null, null],
    [71, 'أستون مارتن', 'Aston Martin', 6, 'astonmartin.com', null, null],
    [72, 'لوتس', 'Lotus', 3, 'lotuscars.com', null, null],
    [73, 'فيراري', 'Ferrari', 11, 'ferrari.com', null, null],
    [74, 'لامبورغيني', 'Lamborghini', 7, 'lamborghini.com', null, null],
    [75, 'هافال', 'Haval', 5, 'haval-global.com', null, null],
    [76, 'بايك', 'BAIC', 4, 'baicintl.com', null, null],
    [77, 'إكسيد', 'EXEED', 4, 'exeedcars.com', null, null],
    [78, 'تانك', 'Tank', 4, 'tanksuv.com', null, null],
    [79, 'هونشي', 'Hongqi', 3, 'hongqi-auto.com', null, null],
    [80, 'ليفان', 'Lifan', 2, 'lifanmotos.net', null, null],
    [81, 'جي أيه سي', 'GAC', 2, 'gac-motor.com', null, null],
    [82, 'فوتون', 'Foton', 2, 'foton-global.com', null, null],
    [83, 'داتسون', 'Datsun', 2, 'datsun.com', null, null],
    [84, 'ماركة اختبار Laravel', 'Laravel Test Brand', 1, 'laravel.test', null, null],
    [85, 'تجربة', 'تجربة', 100, 'قلثلقث', 'CarFront', null],
];
foreach ($brands as $b) {
    DB::table('car_brands')->insert([
        'id' => $b[0], 'ar_name' => $b[1], 'en_name' => $b[2],
        'ads_count' => $b[3], 'domain' => $b[4], 'icon' => $b[5], 'image_url' => $b[6]
    ]);
}
echo "✓ Car brands imported (" . count($brands) . ")\n";

// Car models - I'll use a batch insert approach for efficiency
$models = [
    [1, 58, 'ستيلفيو', 'Stelvio', 1],
    [2, 58, 'جوليا', 'Giulia', 2],
    [3, 58, 'جوليتا', 'Giulietta', 3],
    [4, 71, 'دي بي 11', 'DB11', 1],
    [5, 71, 'فانتيدج', 'Vantage', 2],
    [6, 71, 'دي بي إكس', 'DBX', 3],
    [7, 5, 'تي تي', 'TT', 1],
    [8, 5, 'إي ترون', 'e-tron', 2],
    [9, 5, 'كيو 8', 'Q8', 3],
    [10, 5, 'كيو 7', 'Q7', 4],
    [11, 5, 'كيو 5', 'Q5', 5],
    [12, 5, 'كيو 3', 'Q3', 6],
    [13, 5, 'كيو 2', 'Q2', 7],
    [14, 5, 'أيه 8', 'A8', 8],
    [15, 5, 'أيه 7', 'A7', 9],
    [16, 5, 'أيه 6', 'A6', 10],
    [17, 5, 'أيه 5', 'A5', 11],
    [18, 5, 'أيه 4', 'A4', 12],
    [19, 5, 'أيه 3', 'A3', 13],
    [20, 5, 'أيه 1', 'A1', 14],
    [21, 76, 'بي جيه 40', 'BJ40', 1],
    [22, 76, 'إكس 7', 'X7', 2],
    [23, 76, 'إكس 35', 'X35', 3],
    [24, 59, 'فلاينج سبير', 'Flying Spur', 1],
    [25, 59, 'بينتايجا', 'Bentayga', 2],
    [26, 59, 'كونتيننتال جي تي', 'Continental GT', 3],
    [27, 4, 'زد 4', 'Z4', 1],
    [28, 4, 'إم سيريز', 'M Series', 2],
    [29, 4, 'آي إكس 2', 'iX2', 3],
    [30, 4, 'آي إكس 1', 'iX1', 4],
    [31, 4, 'آي إكس', 'iX', 5],
    [32, 4, 'آي سيريز', 'i Series', 6],
    [33, 4, 'إكس إم', 'XM', 7],
    [34, 4, 'إكس 7', 'X7', 8],
    [35, 4, 'إكس 6', 'X6', 9],
    [36, 4, 'إكس 5', 'X5', 10],
    [37, 4, 'إكس 4', 'X4', 11],
    [38, 4, 'إكس 3', 'X3', 12],
    [39, 4, 'إكس 2', 'X2', 13],
    [40, 4, 'إكس 1', 'X1', 14],
    [41, 4, '8 سيريز', '8 Series', 15],
    [42, 4, '7 سيريز', '7 Series', 16],
    [43, 4, '6 سيريز', '6 Series', 17],
    [44, 4, '5 سيريز', '5 Series', 18],
    [45, 4, '4 سيريز', '4 Series', 19],
    [46, 4, '3 سيريز', '3 Series', 20],
    [47, 4, '2 سيريز', '2 Series', 21],
    [48, 4, '1 سيريز', '1 Series', 22],
    [49, 39, 'جالينا', 'Galena', 1],
    [50, 39, 'اف إس في', 'FSV', 2],
    [51, 39, 'في 5', 'V5', 3],
    [52, 14, 'دولفين', 'Dolphin', 1],
    [53, 14, 'تشين', 'Qin', 2],
    [54, 14, 'سونغ', 'Song', 3],
    [55, 14, 'تانغ', 'Tang', 4],
    [56, 14, 'هان', 'Han', 5],
    [57, 14, 'إف 3', 'F3', 6],
    [58, 18, 'إيه تي إس', 'ATS', 1],
    [59, 18, 'سي تي 5', 'CT5', 2],
    [60, 18, 'إكس تي 5', 'XT5', 3],
    [61, 18, 'سي تي إس', 'CTS', 4],
    [62, 18, 'اسكاليد', 'Escalade', 5],
    [63, 57, 'يوني في', 'Uni-V', 1],
    [64, 57, 'يوني كيه', 'Uni-K', 2],
    [65, 57, 'يوني تي', 'Uni-T', 3],
    [66, 57, 'سي إس 75', 'CS75', 4],
    [67, 57, 'سي إس 35', 'CS35', 5],
    [68, 57, 'إيادو', 'Eado', 6],
    [69, 57, 'السفن', 'Alsvin', 7],
    [70, 22, 'كيو كيو', 'QQ', 1],
    [71, 22, 'أريزو', 'Arrizo', 2],
    [72, 22, 'تيجو', 'Tiggo', 3],
    [73, 6, 'إيكونس', 'Equinox', 1],
    [74, 6, 'تريل بليزر', 'TrailBlazer', 2],
    [75, 6, 'كورفيت', 'Corvette', 3],
    [76, 6, 'سبارك', 'Spark', 4],
    [77, 6, 'كابتيفا', 'Captiva', 5],
    [78, 6, 'ترافرس', 'Traverse', 6],
    [79, 6, 'سيلفرادو', 'Silverado', 7],
    [80, 6, 'تاهو', 'Tahoe', 8],
    [81, 6, 'لومينا', 'Lumina', 9],
    [82, 6, 'كابرس', 'Caprice', 10],
    [83, 6, 'كامارو', 'Camaro', 11],
    [84, 6, 'ماليبو', 'Malibu', 12],
    [85, 6, 'كروز', 'Cruze', 13],
    [86, 6, 'أوبترا', 'Optra', 14],
    [87, 6, 'أفيو', 'Aveo', 15],
    [88, 34, 'باسيليكا', 'Pacifica', 1],
    [89, 34, 'سبرينغ', 'Sebring', 2],
    [90, 34, '300 سي', '300C', 3],
    [91, 40, 'بيرلينجو', 'Berlingo', 1],
    [92, 40, 'سي اليزيه', 'C-Elysée', 2],
    [93, 40, 'سي 5', 'C5', 3],
    [94, 40, 'سي 4', 'C4', 4],
    [95, 40, 'سي 3', 'C3', 5],
    [96, 83, 'جو', 'Go', 1],
    [97, 83, 'اون دو', 'On-DO', 2],
    [98, 83, 'مي دو', 'Mi-DO', 3],
    [99, 28, 'رام', 'Ram', 1],
    [100, 28, 'نيون', 'Neon', 2],
    [101, 28, 'دورانجو', 'Durango', 3],
    [102, 28, 'تشالنجر', 'Challenger', 4],
    [103, 28, 'تشارجر', 'Charger', 5],
    [104, 77, 'إل إكس', 'LX', 1],
    [105, 77, 'في إكس', 'VX', 2],
    [106, 77, 'تي إكس إل', 'TXL', 3],
    [107, 73, 'إف 8', 'F8', 1],
    [108, 73, 'بورتوفينو', 'Portofino', 2],
    [109, 73, 'روما', 'Roma', 3],
    [110, 73, '488 جي تي بي', '488 GTB', 4],
    [111, 51, 'لينيّا', 'Linea', 1],
    [112, 51, 'دوبلو', 'Doblo', 2],
    [113, 51, 'بونتو', 'Punto', 3],
    [114, 51, 'تيبو', 'Tipo', 4],
    [115, 51, '500 / 500X', '500 Series', 5],
    [116, 10, 'مونديو', 'Mondeo', 1],
    [117, 10, 'إكسبيدشن', 'Expedition', 2],
    [118, 10, 'رينجر', 'Ranger', 3],
    [119, 10, 'اف 150', 'F-150', 4],
    [120, 10, 'إيدج', 'Edge', 5],
    [121, 10, 'إيكوسبورت', 'EcoSport', 6],
    [122, 10, 'إسكيب', 'Escape', 7],
    [123, 10, 'إكسبلورر', 'Explorer', 8],
    [124, 10, 'تورس', 'Taurus', 9],
    [125, 10, 'موستانج', 'Mustang', 10],
    [126, 10, 'فييستا', 'Fiesta', 11],
    [127, 10, 'فيوجن', 'Fusion', 12],
    [128, 10, 'فوكس', 'Focus', 13],
    [129, 82, 'فيو', 'View', 1],
    [130, 82, 'تونلاند', 'Tunland', 2],
    [131, 81, 'جي إيه 6', 'GA6', 1],
    [132, 81, 'جي إس 8', 'GS8', 2],
    [133, 81, 'جي إس 4', 'GS4', 3],
    [134, 35, 'هندسة', 'Geometry', 1],
    [135, 35, 'مونجارو', 'Monjaro', 2],
    [136, 35, 'توجيلا', 'Tugella', 3],
    [137, 35, 'كولراي', 'Coolray', 4],
    [138, 35, 'إمجراند', 'Emgrand', 5],
    [139, 27, 'جي في 80', 'GV80', 1],
    [140, 27, 'جي في 70', 'GV70', 2],
    [141, 27, 'جي 90', 'G90', 3],
    [142, 27, 'جي 80', 'G80', 4],
    [143, 27, 'جي 70', 'G70', 5],
    [144, 48, 'تيرين', 'Terrain', 1],
    [145, 48, 'أكاديا', 'Acadia', 2],
    [146, 48, 'سييرا', 'Sierra', 3],
    [147, 48, 'يوكن', 'Yukon', 4],
    [148, 54, 'وينجل', 'Wingle', 1],
    [149, 54, 'باور', 'Poer', 2],
    [150, 75, 'دارجو', 'Dargo', 1],
    [151, 75, 'اتش 9', 'H9', 2],
    [152, 75, 'جولاين', 'Jolion', 3],
    [153, 75, 'اتش 6', 'H6', 4],
    [154, 16, 'جاز', 'Jazz', 1],
    [155, 16, 'أوديسي', 'Odyssey', 2],
    [156, 16, 'بايلوت', 'Pilot', 3],
    [157, 16, 'اتش آر في', 'HR-V', 4],
    [158, 16, 'سي آر في', 'CR-V', 5],
    [159, 16, 'سيتي', 'City', 6],
    [160, 16, 'أكورد', 'Accord', 7],
    [161, 16, 'سيفيك', 'Civic', 8],
    [162, 79, 'إي اتش إس 9', 'E-HS9', 1],
    [163, 79, 'اتش 9', 'H9', 2],
    [164, 79, 'اتش 5', 'H5', 3],
    [165, 79, 'اتش إس 5', 'HS5', 4],
    [166, 1, 'اتش 1', 'H-1', 1],
    [167, 1, 'كوبيه', 'Coupe', 2],
    [168, 1, 'ماتريكس', 'Matrix', 3],
    [169, 1, 'سنتينيال', 'Centennial', 4],
    [170, 1, 'إيكوس', 'Equus', 5],
    [171, 1, 'فينو', 'Vino', 6],
    [172, 1, 'جيتز', 'Getz', 7],
    [173, 1, 'تيرّاكان', 'Terracan', 8],
    [174, 1, 'داينستي', 'Dynasty', 9],
    [175, 1, 'سولاريس', 'Solaris', 10],
    [176, 1, 'آي 40', 'i40', 11],
    [177, 1, 'آي 30', 'i30', 12],
    [178, 1, 'آي 20', 'i20', 13],
    [179, 1, 'آي 10', 'i10', 14],
    [180, 1, 'كريتا', 'Creta', 15],
    [181, 1, 'كونا', 'Kona', 16],
    [182, 1, 'باليسيد', 'Palisade', 17],
    [183, 1, 'فيلوستر', 'Veloster', 18],
    [184, 1, 'جينيسيس', 'Genesis', 19],
    [185, 1, 'غراندور', 'Grandeur', 20],
    [186, 1, 'أزيرا', 'Azera', 21],
    [187, 1, 'سانتا في', 'Santa Fe', 22],
    [188, 1, 'توسان', 'Tucson', 23],
    [189, 1, 'سوناتا', 'Sonata', 24],
    [190, 1, 'أفانتي', 'Avante', 25],
    [191, 1, 'إلنترا', 'Elantra', 26],
    [192, 1, 'أكسنت', 'Accent', 27],
    [193, 69, 'إن آر', 'NPR', 1],
    [194, 69, 'ام يو اكس', 'MU-X', 2],
    [195, 69, 'دي ماكس', 'D-Max', 3],
    [196, 55, 'إس 4', 'S4', 1],
    [197, 55, 'إس 3', 'S3', 2],
    [198, 55, 'جيه 7', 'J7', 3],
    [199, 41, 'إف تايب', 'F-Type', 1],
    [200, 41, 'إكس إيه', 'XE', 2],
    [201, 41, 'إكس جيه', 'XJ', 3],
    [202, 41, 'إكس إف', 'XF', 4],
    [203, 41, 'إف بيس', 'F-Pace', 5],
    [204, 21, 'كوماندير', 'Commander', 1],
    [205, 21, 'جليادتور', 'Gladiator', 2],
    [206, 21, 'رينيجيد', 'Renegade', 3],
    [207, 21, 'كومباس', 'Compass', 4],
    [208, 21, 'رانجلر', 'Wrangler', 5],
    [209, 21, 'شيروكي', 'Cherokee', 6],
    [210, 21, 'جراند شيروكي', 'Grand Cherokee', 7],
    [211, 49, 'داشينج', 'Dashing', 1],
    [212, 49, 'إكس 90', 'X90', 2],
    [213, 49, 'إكس 70', 'X70', 3],
    [214, 2, 'بيجاس', 'Pegas', 1],
    [215, 2, 'ستونيك', 'Stonic', 2],
    [216, 2, 'أوبيروس', 'Opirus', 3],
    [217, 2, 'برايد', 'Pride', 4],
    [218, 2, 'تيلورايد', 'Telluride', 5],
    [219, 2, 'شوما', 'Shuma', 6],
    [220, 2, 'كارينز', 'Carens', 7],
    [221, 2, 'سيلتوس', 'Seltos', 8],
    [222, 2, 'كادينزا', 'Cadenza', 9],
    [223, 2, 'ستينغر', 'Stinger', 10],
    [224, 2, 'كارنفال', 'Carnival', 11],
    [225, 2, 'موهافي', 'Mohave', 12],
    [226, 2, 'سيد', 'Ceed', 13],
    [227, 2, 'فورتي', 'Forte', 14],
    [228, 2, 'نيرو', 'Niro', 15],
    [229, 2, 'سول', 'Soul', 16],
    [230, 2, 'سورينتو', 'Sorento', 17],
    [231, 2, 'سبورتاج', 'Sportage', 18],
    [232, 2, 'كي 9', 'K9', 19],
    [233, 2, 'كي 7', 'K7', 20],
    [234, 2, 'كي 3', 'K3', 21],
    [235, 2, 'كي 5', 'K5', 22],
    [236, 2, 'أوبتيما', 'Optima', 23],
    [237, 2, 'بيكانتو', 'Picanto', 24],
    [238, 2, 'ريو', 'Rio', 25],
    [239, 2, 'سيراتو', 'Cerato', 26],
    [240, 74, 'أفينتادور', 'Aventador', 1],
    [241, 74, 'هوراكان', 'Huracan', 2],
    [242, 74, 'أوروس', 'Urus', 3],
    [243, 9, 'لاند روفر إل آر 4', 'LR4', 1],
    [244, 9, 'ديسكفري سبورت', 'Discovery Sport', 2],
    [245, 9, 'ديسكفري', 'Discovery', 3],
    [246, 9, 'ديفندر', 'Defender', 4],
    [247, 9, 'رنج روفر فيلار', 'Velar', 5],
    [248, 9, 'رنج روفر إيفوك', 'Evoque', 6],
    [249, 9, 'رنج روفر سبورت', 'Range Rover Sport', 7],
    [250, 9, 'رنج روفر', 'Range Rover', 8],
    [251, 37, 'إل سي', 'LC', 1],
    [252, 37, 'يو إكس', 'UX', 2],
    [253, 37, 'جي إكس', 'GX', 3],
    [254, 37, 'إن إكس', 'NX', 4],
    [255, 37, 'آر إكس', 'RX', 5],
    [256, 37, 'إل إكس', 'LX', 6],
    [257, 37, 'جي إس', 'GS', 7],
    [258, 37, 'إل إس', 'LS', 8],
    [259, 37, 'آي إس', 'IS', 9],
    [260, 37, 'إي إس', 'ES', 10],
    [261, 80, 'ليفان X60', 'X60', 1],
    [262, 80, 'ليفان 520', '520', 2],
    [263, 62, 'افياتور', 'Aviator', 1],
    [264, 62, 'إم كي زد', 'MKZ', 2],
    [265, 62, 'كونتيننتال', 'Continental', 3],
    [266, 62, 'نافيجيتور', 'Navigator', 4],
    [267, 72, 'إيميرا', 'Emira', 1],
    [268, 72, 'إيفيرا', 'Evora', 2],
    [269, 63, 'كواتروبورتي', 'Quattroporte', 1],
    [270, 63, 'ليفانتي', 'Levante', 2],
    [271, 63, 'جيبلي', 'Ghibli', 3],
    [272, 15, 'إم إكس 5', 'MX-5', 1],
    [273, 15, 'سي إكس 30', 'CX-30', 2],
    [274, 15, 'سي إكس 9', 'CX-9', 3],
    [275, 15, 'سي إكس 5', 'CX-5', 4],
    [276, 15, 'سي إكس 3', 'CX-3', 5],
    [277, 15, 'مازدا 6', 'Mazda 6', 6],
    [278, 15, 'مازدا 3', 'Mazda 3', 7],
    [279, 15, 'مازدا 2', 'Mazda 2', 8],
    [280, 3, 'فانيو', 'Vaneo', 1],
    [281, 3, 'فيتو', 'Vito', 2],
    [282, 3, 'سي إل كيه', 'CLK', 3],
    [283, 3, 'إس إل كيه', 'SLK', 4],
    [284, 3, 'جي إل إس', 'GLS', 5],
    [285, 3, 'جي إل إيه', 'GLA', 6],
    [286, 3, 'جي إل سي', 'GLC', 7],
    [287, 3, 'جي إل إي', 'GLE', 8],
    [288, 3, 'سي إل إس', 'CLS', 9],
    [289, 3, 'سي إل إيه', 'CLA', 10],
    [290, 3, 'الفئة بي', 'B-Class', 11],
    [291, 3, 'الفئة إيه', 'A-Class', 12],
    [292, 3, 'الفئة جي', 'G-Class', 13],
    [293, 3, 'الفئة إس', 'S-Class', 14],
    [294, 3, 'الفئة إي', 'E-Class', 15],
    [295, 3, 'الفئة سي', 'C-Class', 16],
    [296, 46, 'ام جي 3', 'MG 3', 1],
    [297, 46, 'ام جي آر إكس 5', 'RX5', 2],
    [298, 46, 'ام جي اتش اس', 'HS', 3],
    [299, 46, 'ام جي زد إس', 'ZS', 4],
    [300, 46, 'ام جي 6', 'MG 6', 5],
    [301, 46, 'ام جي 5', 'MG 5', 6],
    [302, 47, 'كلوب مان', 'Clubman', 1],
    [303, 47, 'كاونتري مان', 'Countryman', 2],
    [304, 47, 'كوبر إس', 'Cooper S', 3],
    [305, 47, 'كوبر', 'Cooper', 4],
    [306, 13, 'إس آكس', 'ASX', 1],
    [307, 13, 'ميراج', 'Mirage', 2],
    [308, 13, 'إل 200', 'L200', 3],
    [309, 13, 'أتراج', 'Attrage', 4],
    [310, 13, 'إكليبس كروس', 'Eclipse Cross', 5],
    [311, 13, 'أوتلاندر', 'Outlander', 6],
    [312, 13, 'باجيرو', 'Pajero', 7],
    [313, 13, 'لانسر', 'Lancer', 8],
    [314, 8, 'زد', 'Z-Car', 1],
    [315, 8, 'تيدا', 'Tiida', 2],
    [316, 8, 'ميكرا', 'Micra', 3],
    [317, 8, 'كيكس', 'Kicks', 4],
    [318, 8, 'جوك', 'Juke', 5],
    [319, 8, 'كشكاي', 'Qashqai', 6],
    [320, 8, 'باثفايندر', 'Pathfinder', 7],
    [321, 8, 'إكس تريل', 'X-Trail', 8],
    [322, 8, 'باترول', 'Patrol', 9],
    [323, 8, 'مكسيما', 'Maxima', 10],
    [324, 8, 'ألتيما', 'Altima', 11],
    [325, 8, 'سنترا', 'Sentra', 12],
    [326, 8, 'صني', 'Sunny', 13],
    [327, 11, 'بارتنر', 'Partner', 1],
    [328, 11, '5008', '5008', 2],
    [329, 11, '3008', '3008', 3],
    [330, 11, '2008', '2008', 4],
    [331, 11, '508', '508', 5],
    [332, 11, '301 / 307 / 308', '308 Series', 6],
    [333, 11, '206 / 207 / 208', '208 Series', 7],
    [334, 30, 'بريسونا', 'Persona', 1],
    [335, 30, 'جين 2', 'Gen-2', 2],
    [336, 30, 'ساجا', 'Saga', 3],
    [337, 20, 'فلوانس', 'Fluence', 1],
    [338, 20, 'كابتشر', 'Captur', 2],
    [339, 20, 'سيمبول', 'Symbol', 3],
    [340, 20, 'كليو', 'Clio', 4],
    [341, 20, 'كادجار', 'Kadjar', 5],
    [342, 20, 'داستر', 'Duster', 6],
    [343, 20, 'ميجان', 'Megane', 7],
    [344, 20, 'لوجان', 'Logan', 8],
    [345, 70, 'رايث', 'Wraith', 1],
    [346, 70, 'كالينان', 'Cullinan', 2],
    [347, 70, 'فانتوم', 'Phantom', 3],
    [348, 70, 'غوست', 'Ghost', 4],
    [349, 26, 'ريكستون', 'Rexton', 1],
    [350, 26, 'كوراندو', 'Korando', 2],
    [351, 26, 'تيفولي', 'Tivoli', 3],
    [352, 32, 'دبليو آر إكس', 'WRX', 1],
    [353, 32, 'ليجاسي', 'Legacy', 2],
    [354, 32, 'أوتباك', 'Outback', 3],
    [355, 32, 'إكس في', 'XV', 4],
    [356, 32, 'فورستر', 'Forester', 5],
    [357, 32, 'إمبريزا', 'Impreza', 6],
    [358, 24, 'جراند فيتارا', 'Grand Vitara', 1],
    [359, 24, 'دزاير', 'Dzire', 2],
    [360, 24, 'بالينو', 'Baleno', 3],
    [361, 24, 'إرتيجا', 'Ertiga', 4],
    [362, 24, 'فيتارا', 'Vitara', 5],
    [363, 24, 'جيمّني', 'Jimny', 6],
    [364, 24, 'ألتو', 'Alto', 7],
    [365, 24, 'سيليريو', 'Celerio', 8],
    [366, 24, 'سويفت', 'Swift', 9],
    [367, 78, 'تانك 500', 'Tank 500', 1],
    [368, 78, 'تانك 300', 'Tank 300', 2],
    [369, 65, 'موديل إكس', 'Model X', 1],
    [370, 65, 'موديل إس', 'Model S', 2],
    [371, 65, 'موديل واي', 'Model Y', 3],
    [372, 65, 'موديل 3', 'Model 3', 4],
    [373, 12, 'انوفا', 'Innova', 1],
    [374, 12, 'إف جي كروزر', 'FJ Cruiser', 2],
    [375, 12, 'سوبرا', 'Supra', 3],
    [376, 12, 'سي اتش آر', 'C-HR', 4],
    [377, 12, 'هيلاكس', 'Hilux', 5],
    [378, 12, 'رش', 'Rush', 6],
    [379, 12, 'هايلاندر', 'Highlander', 7],
    [380, 12, 'فورتشنر', 'Fortuner', 8],
    [381, 12, 'راف 4', 'RAV4', 9],
    [382, 12, 'لاند كروزر', 'Land Cruiser', 10],
    [383, 12, 'برادو', 'Prado', 11],
    [384, 12, 'أوريس', 'Auris', 12],
    [385, 12, 'أفالون', 'Avalon', 13],
    [386, 12, 'كامري', 'Camry', 14],
    [387, 12, 'كورولا', 'Corolla', 15],
    [388, 12, 'يارس', 'Yaris', 16],
    [389, 42, 'إكس سي 90', 'XC90', 1],
    [390, 42, 'إكس سي 60', 'XC60', 2],
    [391, 42, 'إكس سي 40', 'XC40', 3],
    [392, 42, 'إس 90', 'S90', 4],
    [393, 42, 'إس 60', 'S60', 5],
    [394, 56, 'زد 100', 'Z100', 1],
    [395, 56, 'تي 600', 'T600', 2],
];
foreach ($models as $m) {
    DB::table('car_models')->insert([
        'id' => $m[0], 'brand_id' => $m[1], 'ar_name' => $m[2],
        'en_name' => $m[3], 'ads_count' => $m[4]
    ]);
}
echo "✓ Car models imported (" . count($models) . ")\n";

// Real estate categories
$reCats = [
    ['apartments', 'الشقق السكنية', 'Apartments', 6739, null, null],
    ['arabic', 'البيوت العربية', 'Arabic Houses', 402, null, null],
    ['buildings', 'الأبنية', 'Buildings', 415, null, null],
    ['lands', 'الأراضي', 'Lands', 2609, null, null],
    ['projects', 'مشاريع عقارية قيد التنفيذ', 'Projects Under Construction', 198, null, null],
    ['shops', 'المحلات التجارية', 'Commercial Shops', 1637, null, null],
    ['villas', 'الفلل والمزارع', 'Villas & Farms', 1419, null, null],
];
foreach ($reCats as $rc) {
    DB::table('real_estate_categories')->insert([
        'id' => $rc[0], 'ar_name' => $rc[1], 'en_name' => $rc[2],
        'ads_count' => $rc[3], 'image_url' => $rc[4], 'icon' => $rc[5]
    ]);
}
echo "✓ Real estate categories imported (" . count($reCats) . ")\n";

// Real estate subcategories
$reSubs = [
    [1, 'apartments', 'شقق للبيع', 'Apartments for Sale', 4200, null],
    [2, 'apartments', 'شقق مفروشة فندقية للإيجار', 'Furnished Hotel Apartments for Rent', 800, null],
    [3, 'apartments', 'شقق للإيجار', 'Apartments for Rent', 1739, null],
    [4, 'lands', 'أراضي للبيع', 'Lands for Sale', 2400, null],
    [5, 'lands', 'أراضي للإيجار', 'Lands for Rent', 209, null],
    [6, 'shops', 'محلات تجارية للبيع', 'Shops for Sale', 1100, null],
    [7, 'shops', 'محلات تجارية للإيجار', 'Shops for Rent', 537, null],
    [8, 'villas', 'فلل ومزارع للبيع', 'Villas & Farms for Sale', 900, null],
    [9, 'villas', 'فلل ومزارع للإيجار', 'Villas & Farms for Rent', 519, null],
    [10, 'buildings', 'أبنية للبيع', 'Buildings for Sale', 250, null],
    [11, 'buildings', 'أبنية للإيجار', 'Buildings for Rent', 165, null],
    [12, 'arabic', 'بيوت عربية للبيع', 'Arabic Houses for Sale', 250, null],
    [13, 'arabic', 'بيوت عربية للإيجار', 'Arabic Houses for Rent', 152, null],
    [14, 'projects', 'مشاريع سكنية قيد الإنشاء', 'Residential Projects under Construction', 120, null],
    [15, 'projects', 'مشاريع تجارية قيد الإنشاء', 'Commercial Projects under Construction', 78, null],
];
foreach ($reSubs as $rs) {
    DB::table('real_estate_subcategories')->insert([
        'id' => $rs[0], 'category_id' => $rs[1], 'ar_name' => $rs[2],
        'en_name' => $rs[3], 'ads_count' => $rs[4], 'image_url' => $rs[5]
    ]);
}
echo "✓ Real estate subcategories imported (" . count($reSubs) . ")\n";

// Ads
$adsData = [
    ['syr-car-1', null, 'cars', 'هيونداي سانتا في موديل 2008 خالية العلام', null, 12500.00, '$', 'حلب، الأشرفية', null, null, 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600', 1, '2026-06-07', '2026-06-20 09:37:22', '2026-06-20 09:37:22'],
    ['syr-car-2', null, 'cars', 'كيا سيراتو موديل 2012 توب رينج', null, 9800.00, '$', 'دمشق، برزة', null, null, 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600', 1, '2026-06-06', '2026-06-20 09:37:22', '2026-06-20 09:37:22'],
    ['syr-car-3', null, 'cars', 'هيونداي أفانتي HD كرت بنزين', null, 8500.00, '$', 'حمص، الإنشاءات', null, null, 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600', 0, '2026-06-05', '2026-06-20 09:37:23', '2026-06-20 09:37:23'],
    ['syr-car-4', null, 'cars', 'تويوتا أفالون ليميتد بحالة ممتاز', null, 19500.00, '$', 'اللاذقية، المشروع الأول', null, null, 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fd?auto=format&fit=crop&q=80&w=600', 0, '2026-06-03', '2026-06-20 09:37:23', '2026-06-20 09:37:23'],
    ['syr-re-1', null, 'real-estate', 'شقة سكنية ديلوكس مفروشة للإيجار السنوي', null, 36000000.00, 'ل.س/سنة', 'دمشق، المزة', null, null, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=600', 1, '2026-06-04', '2026-06-20 09:37:23', '2026-06-20 09:37:23'],
    ['syr-re-2', null, 'real-estate', 'فيلا مستقلة فاخرة مع حديقة ومسبح للبيع الفوري', null, 1200000.00, '$', 'ريف دمشق، يعفور', null, null, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600', 1, '2026-06-05', '2026-06-20 09:37:23', '2026-06-20 09:37:23'],
    ['syr-re-3', null, 'real-estate', 'شقة طابو أخضر في مشروع دمر للبيع المباشر', null, 450000000.00, 'ل.س', 'دمشق، مشروع دمر', null, null, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600', 0, '2026-06-02', '2026-06-20 09:37:23', '2026-06-20 09:37:23'],
    ['laravel-test-ad-1', null, 'cars', 'اختبار Laravel تخزين إعلان سيارة', 'إعلان تجريبي من Laravel API', 12345.00, '$', 'دمشق، اختبار', 'سيارات للبيع', 'للبيع', 'https://example.com/car.jpg', 0, '2026-06-20', '2026-06-20 09:49:15', '2026-06-20 09:49:15'],
    ['cars-1781954035', null, 'cars', 'تويتا كامري بالشحم', 'حثفناخحلات تفجخلاحت حخة', 1000005.00, 'دولار', 'دمشق، ميدان', 'سيارات سياحية للبيع', null, 'http://127.0.0.1:8000/images/ads/ad_cars-1781954035_6a3675f3d6635_cover.png', 0, '2026-06-20', '2026-06-20 11:13:55', '2026-06-20 11:16:53'],
    ['cars-1781954037', null, 'cars', 'تويتا كامري بالشحم', 'حثفناخحلات تفجخلاحت حخة', 1000005.00, 'دولار', 'دمشق، ميدان', 'سيارات سياحية للبيع', null, 'http://127.0.0.1:8000/images/ads/ad_cars-1781954037_6a3675f57b9c2_cover.png', 0, '2026-06-20', '2026-06-20 11:13:57', '2026-06-20 11:16:53'],
    ['cars-1781958151', null, 'real-estate', 'هنننننننننننننننننننننن', 'نننننننننننننننننننننننن', 50000.00, 'دولار', 'دمشق، تنانا', 'شقق للبيع والإيجار', null, 'http://127.0.0.1:8000/images/ads/ad_real-estate-1781958151_6a3686072635c_cover.png', 0, '2026-06-20', '2026-06-20 12:22:31', '2026-06-20 12:22:31'],
    ['cars-1781959026', null, 'cars', 'ماخهكاهكخلاهجخ', 'خهاهخلهعلجخه', 5000000000000.00, 'ل.س', 'دمشق، ىتتت', 'سيارات سياحية للبيع', null, 'http://127.0.0.1:8000/images/ads/ad_cars-1781959026_6a368972cd002_cover.png', 0, '2026-06-20', '2026-06-20 12:37:06', '2026-06-20 12:37:06'],
    ['cars-1781961676', null, 'cars', '????? ?????? ?????', '????? ????? ?????? ????? 2024', 5000.00, '?.?', '????', '?????? ?????? ?????', '?????', null, 0, '2026-06-20', '2026-06-20 13:21:16', '2026-06-20 13:21:16'],
    ['cars-1782129548', null, 'cars', 'r333333dd', 'deewdewdewdw', 20000.00, 'دولار', 'دمشق، dww', 'سيارات سياحية للبيع', null, 'http://127.0.0.1:8000/images/ads/ad_cars-1782129548_6a39238cdd029_cover.png', 0, '2026-06-22', '2026-06-22 11:59:08', '2026-06-22 11:59:08'],
    ['cars-1782129551', null, 'cars', 'r333333dd', 'deewdewdewdw', 20000.00, 'دولار', 'دمشق، dww', 'سيارات سياحية للبيع', null, 'http://127.0.0.1:8000/images/ads/ad_cars-1782129551_6a39238f92946_cover.png', 1, '2026-06-22', '2026-06-22 11:59:11', '2026-06-22 11:59:42'],
    ['cars-1782131819', null, 'cars', 'نمنمنمنمن', 'حنحنحنحنح', 520.00, 'ل.س', 'دمشق، نمنممنمن', 'سيارات سياحية للبيع', null, 'http://127.0.0.1:8000/images/ads/ad_cars-1782131819_6a392c6b90bf9_cover.png', 0, '2026-06-22', '2026-06-22 12:36:59', '2026-06-22 12:36:59'],
];
foreach ($adsData as $ad) {
    DB::table('ads')->insert([
        'id' => $ad[0], 'owner_user_id' => $ad[1], 'category' => $ad[2],
        'title' => $ad[3], 'description' => $ad[4], 'price' => $ad[5],
        'currency' => $ad[6], 'location' => $ad[7], 'subcategory' => $ad[8],
        'purpose' => $ad[9], 'cover_image_url' => $ad[10],
        'is_featured' => $ad[11], 'published_on' => $ad[12],
        'created_at' => $ad[13], 'updated_at' => $ad[14]
    ]);
}
echo "✓ Ads imported (" . count($adsData) . ")\n";

// Ad images
$adImages = [
    [1, 'syr-car-1', 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600', 0, 1],
    [2, 'syr-car-2', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600', 0, 1],
    [3, 'syr-car-3', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600', 0, 1],
    [4, 'syr-car-4', 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fd?auto=format&fit=crop&q=80&w=600', 0, 1],
    [5, 'syr-re-1', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=600', 0, 1],
    [6, 'syr-re-2', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600', 0, 1],
    [7, 'syr-re-3', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600', 0, 1],
    [8, 'laravel-test-ad-1', 'https://example.com/car.jpg', 0, 1],
    [9, 'laravel-test-ad-1', 'https://example.com/car-2.jpg', 1, 0],
    [11, 'cars-1781954035', 'http://127.0.0.1:8000/images/ads/ad_cars-1781954035_6a3675f3e9ea0_img0.png', 0, 1],
    [12, 'cars-1781954037', 'http://127.0.0.1:8000/images/ads/ad_cars-1781954037_6a3675f58bfe6_img0.png', 0, 1],
    [13, 'cars-1781958151', 'http://127.0.0.1:8000/images/ads/ad_real-estate-1781958151_6a36860732c27_img0.png', 0, 1],
    [14, 'cars-1781959026', 'http://127.0.0.1:8000/images/ads/ad_cars-1781959026_6a368972d65ff_img0.png', 0, 1],
    [15, 'cars-1781959026', 'http://127.0.0.1:8000/images/ads/ad_cars-1781959026_6a368972d970c_img1.png', 1, 0],
    [16, 'cars-1781959026', 'http://127.0.0.1:8000/images/ads/ad_cars-1781959026_6a368972dcffe_img2.png', 2, 0],
    [19, 'cars-1782129548', 'http://127.0.0.1:8000/images/ads/ad_cars-1782129548_6a39238cecccf_img0.png', 0, 1],
    [20, 'cars-1782129551', 'http://127.0.0.1:8000/images/ads/ad_cars-1782129551_6a39238fa0101_img0.png', 0, 1],
    [23, 'cars-1782131819', 'http://127.0.0.1:8000/images/ads/ad_cars-1782131819_6a392c6b95177_img0.png', 0, 1],
];
foreach ($adImages as $ai) {
    DB::table('ad_images')->insert([
        'id' => $ai[0], 'ad_id' => $ai[1], 'image_url' => $ai[2],
        'sort_order' => $ai[3], 'is_cover' => $ai[4]
    ]);
}
echo "✓ Ad images imported (" . count($adImages) . ")\n";

// Ad videos
DB::table('ad_videos')->insert([
    'id' => 2, 'ad_id' => 'cars-1782131819', 'video_url' => 'http://127.0.0.1:8000/videos/ads/ad_cars-1782131819_6a392c6b96408_video0.mp4', 'sort_order' => 0
]);
echo "✓ Ad videos imported\n";

// Notifications
$notifications = [
    ['n1', null, 'مرحباً بك في سوق سوريا المفتوح للسيارات والعقارات', 'يسعدنا انضمامك إلى منصتنا للبحث عن أفضل العقارات والسيارات المتاحة في سوريا.', 'الآن', 0, '2026-06-20 09:37:23'],
    ['n2', null, 'تنبيه إشعار جديد يطابق تفضيلاتك', 'تم إضافة سيارة "كيا سيراتو" جديدة للبيع في دمشق للتو.', 'قبل ساعتين', 0, '2026-06-20 09:37:23'],
    ['n3', null, 'تم توثيق وتفعيل حسابك بنجاح', 'رقم هاتف سوريا الخاص بك مفعل الآن، يمكنك إضافة إعلانات جديدة بسهولة الآن.', 'منذ يومين', 1, '2026-06-20 09:37:23'],
];
foreach ($notifications as $n) {
    DB::table('notifications')->insert([
        'id' => $n[0], 'user_id' => $n[1], 'title' => $n[2],
        'body' => $n[3], 'display_date' => $n[4], 'is_read' => $n[5],
        'created_at' => $n[6]
    ]);
}
echo "✓ Notifications imported (" . count($notifications) . ")\n";

// Valuation reports
DB::table('valuation_reports')->insert([
    'id' => 'valuation-test-1', 'type' => 'cars', 'title' => 'تقرير اختبار',
    'specs' => 'من واجهة API', 'estimated_price' => 100.00,
    'min_price' => 90.00, 'max_price' => 110.00, 'report_date' => '2026-06-20',
    'created_at' => '2026-06-20 09:59:05'
]);
echo "✓ Valuation reports imported\n";

// App settings
DB::table('app_settings')->insert(['setting_key' => 'cars_enabled', 'setting_value' => '1']);
echo "✓ App settings imported\n";

echo "\n✅ All data imported successfully!\n";
echo "Tables summary:\n";
echo "  Countries: " . DB::table('countries')->count() . "\n";
echo "  Users: " . DB::table('users')->count() . "\n";
echo "  Car Brands: " . DB::table('car_brands')->count() . "\n";
echo "  Car Models: " . DB::table('car_models')->count() . "\n";
echo "  Real Estate Categories: " . DB::table('real_estate_categories')->count() . "\n";
echo "  Real Estate Subcategories: " . DB::table('real_estate_subcategories')->count() . "\n";
echo "  Ads: " . DB::table('ads')->count() . "\n";
echo "  Ad Images: " . DB::table('ad_images')->count() . "\n";
echo "  Notifications: " . DB::table('notifications')->count() . "\n";


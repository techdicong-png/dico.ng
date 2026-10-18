// Which LGAs make up each senatorial district and federal constituency.
// Source: constituency list as at Nov 2024 (Wikipedia, from INEC), matched to the app's LGA names.
// LGAs that are split between two constituencies (Lagos Island, Mushin, Oshodi-Isolo, Surulere, Port Harcourt)
// appear in both; a voter there is treated as inside both.
export const SENATORIAL_DISTRICT_LGAS: Record<string, Record<string, string[]>> = {
  "Abia": {
    "Abia Central": ["Ikwuano", "Isiala Ngwa North", "Isiala Ngwa South", "Obingwa", "Osisioma", "Ugwunagbo", "Umuahia North", "Umuahia South"],
    "Abia North": ["Arochukwu", "Bende", "Isuikwuato", "Ohafia", "Umu-Nneochi"],
    "Abia South": ["Aba North", "Aba South", "Ukwa East", "Ukwa West"]
  },
  "Adamawa": {
    "Adamawa Central": ["Fufore", "Girei", "Gombi", "Hong", "Song", "Yola North", "Yola South"],
    "Adamawa North": ["Madagali", "Maiha", "Michika", "Mubi North", "Mubi South"],
    "Adamawa South": ["Demsa", "Ganye", "Guyuk", "Jada", "Lamurde", "Mayo-Belwa", "Numan", "Shelleng", "Toungo"]
  },
  "Akwa Ibom": {
    "Akwa Ibom North East": ["Etinan", "Ibesikpo/Asutan", "Ibiono Ibom", "Itu", "Nsit Atai", "Nsit Ibom", "Nsit Ubium", "Uruan", "Uyo"],
    "Akwa Ibom North West": ["Abak", "Essien Udim", "Etim Ekpo", "Ika", "Ikono", "Ikot Ekpene", "Ini", "Obot Akara", "Oruk Anam", "Ukanafun"],
    "Akwa Ibom South": ["Eastern Obolo", "Eket", "Esit Eket", "Ibeno", "Ikot Abasi", "Mbo", "Mkpat Enin", "Okobo", "Onna", "Oron", "Udung Uko", "Urue Offong/Oruko"]
  },
  "Anambra": {
    "Anambra Central": ["Anaocha", "Awka North", "Awka South", "Dunukofia", "Idemili North", "Idemili South", "Njikoka"],
    "Anambra North": ["Anambra East", "Anambra West", "Ayamelum", "Ogbaru", "Onitsha North", "Onitsha South", "Oyi"],
    "Anambra South": ["Aguata", "Ekwusigo", "Ihiala", "Nnewi North", "Nnewi South", "Orumba North", "Orumba South"]
  },
  "Bauchi": {
    "Bauchi Central": ["Damban", "Darazo", "Ganjuwa", "Misau", "Ningi", "Warji"],
    "Bauchi North": ["Gamawa", "Giade", "Itas/Gadau", "Jama'are", "Katagum", "Shira", "Zaki"],
    "Bauchi South": ["Alkaleri", "Bauchi", "Bogoro", "Dass", "Kirfi", "Tafawa Balewa", "Toro"]
  },
  "Bayelsa": {
    "Bayelsa Central": ["Kolokuma/Opokuma", "Southern Ijaw", "Yenagoa"],
    "Bayelsa East": ["Brass", "Nembe", "Ogbia"],
    "Bayelsa West": ["Ekeremor", "Sagbama"]
  },
  "Benue": {
    "Benue North East": ["Katsina-Ala", "Konshisha", "Kwande", "Logo", "Ukum", "Ushongo", "Vandeikya"],
    "Benue North West": ["Buruku", "Gboko", "Guma", "Gwer East", "Gwer West", "Makurdi", "Tarka"],
    "Benue South": ["Ado", "Agatu", "Apa", "Obi", "Ogbadibo", "Ohimini", "Oju", "Okpokwu", "Otukpo"]
  },
  "Borno": {
    "Borno Central": ["Bama", "Dikwa", "Jere", "Kala Balge", "Konduga", "Mafa", "Maiduguri", "Ngala"],
    "Borno North": ["Abadam", "Gubio", "Guzamala", "Kaga", "Kukawa", "Magumeri", "Marte", "Mobbar", "Monguno", "Nganzai"],
    "Borno South": ["Askira/Uba", "Bayo", "Biu", "Chibok", "Damboa", "Gwoza", "Hawul", "Kwaya Kusar", "Shani"]
  },
  "Cross River": {
    "Cross River Central": ["Abi", "Boki", "Etung", "Ikom", "Obubra", "Yakurr"],
    "Cross River North": ["Bekwarra", "Obanliku", "Obudu", "Ogoja", "Yala"],
    "Cross River South": ["Akamkpa", "Akpabuyo", "Bakassi", "Biase", "Calabar Municipality", "Calabar South", "Odukpani"]
  },
  "Delta": {
    "Delta Central": ["Ethiope East", "Ethiope West", "Okpe", "Sapele", "Udu", "Ughelli North", "Ughelli South", "Uvwie"],
    "Delta North": ["Aniocha North", "Aniocha South", "Ika North East", "Ika South", "Ndokwa East", "Ndokwa West", "Oshimili North", "Oshimili South", "Ukwuani"],
    "Delta South": ["Bomadi", "Burutu", "Isoko North", "Isoko South", "Patani", "Warri North", "Warri South", "Warri South West"]
  },
  "Ebonyi": {
    "Ebonyi Central": ["Ezza North", "Ezza South", "Ikwo", "Ishielu"],
    "Ebonyi North": ["Abakaliki", "Ebonyi", "Izzi", "Ohaukwu"],
    "Ebonyi South": ["Afikpo North", "Afikpo South", "Ivo", "Ohaozara", "Onicha"]
  },
  "Edo": {
    "Edo Central": ["Esan Central", "Esan North East", "Esan South East", "Esan West", "Igueben"],
    "Edo North": ["Akoko Edo", "Etsako Central", "Etsako East", "Etsako West", "Owan East", "Owan West"],
    "Edo South": ["Egor", "Ikpoba Okha", "Oredo", "Orhionmwon", "Ovia North East", "Ovia South West", "Uhunmwonde"]
  },
  "Ekiti": {
    "Ekiti Central": ["Ado Ekiti", "Efon", "Ekiti West", "Ijero", "Irepodun/Ifelodun"],
    "Ekiti North": ["Ido/Osi", "Ikole", "Ilejemeje", "Moba", "Oye"],
    "Ekiti South": ["Ekiti East", "Ekiti South West", "Emure", "Gbonyin", "Ikere", "Ise/Orun"]
  },
  "Enugu": {
    "Enugu East": ["Enugu East", "Enugu North", "Enugu South", "Isi Uzo", "Nkanu East", "Nkanu West"],
    "Enugu North": ["Igbo Etiti", "Igbo Eze North", "Igbo Eze South", "Nsukka", "Udenu", "Uzo Uwani"],
    "Enugu West": ["Aninri", "Awgu", "Ezeagu", "Oji River", "Udi"]
  },
  "FCT Abuja": {
    "FCT": ["Abaji", "Abuja Municipal", "Bwari", "Gwagwalada", "Kuje", "Kwali"]
  },
  "Gombe": {
    "Gombe Central": ["Akko", "Yamaltu/Deba"],
    "Gombe North": ["Dukku", "Funakaye", "Gombe", "Kwami", "Nafada"],
    "Gombe South": ["Balanga", "Billiri", "Kaltungo", "Shongom"]
  },
  "Imo": {
    "Imo East": ["Aboh Mbaise", "Ahiazu Mbaise", "Ezinihitte", "Ikeduru", "Mbaitoli", "Ngor Okpala", "Owerri Municipal", "Owerri North", "Owerri West"],
    "Imo North": ["Ehime Mbano", "Ihitte/Uboma", "Isiala Mbano", "Obowo", "Okigwe", "Unuimo"],
    "Imo West": ["Ideato North", "Ideato South", "Isu", "Njaba", "Nkwerre", "Nwangele", "Oguta", "Ohaji/Egbema", "Orlu", "Orsu", "Oru East", "Oru West"]
  },
  "Jigawa": {
    "Jigawa North East": ["Auyo", "Hadejia", "Kafin Hausa", "Kaugama", "Malam Madori"],
    "Jigawa North West": ["Babura", "Gagarawa", "Garki", "Gumel", "Gwiwa", "Kazaure", "Maigatari", "Ringim", "Roni", "Sule Tankarkar", "Taura", "Yankwashi"],
    "Jigawa South West": ["Biriniwa", "Birnin Kudu", "Buji", "Dutse", "Guri", "Gwaram", "Jahun", "Kiri Kasamma", "Kiyawa", "Miga"]
  },
  "Kaduna": {
    "Kaduna Central": ["Birnin Gwari", "Chikun", "Giwa", "Igabi", "Kaduna North", "Kaduna South", "Kajuru"],
    "Kaduna North": ["Ikara", "Kubau", "Kudan", "Lere", "Makarfi", "Sabon Gari", "Soba", "Zaria"],
    "Kaduna South": ["Jaba", "Jema'a", "Kachia", "Kagarko", "Kaura", "Kauru", "Sanga", "Zangon Kataf"]
  },
  "Kano": {
    "Kano Central": ["Dala", "Dawakin Kudu", "Fagge", "Gabasawa", "Garun Mallam", "Gezawa", "Gwale", "Kano Municipal", "Kumbotso", "Kura", "Madobi", "Minjibir", "Nasarawa", "Tarauni", "Ungogo", "Warawa"],
    "Kano North": ["Bagwai", "Bichi", "Dambatta", "Dawakin Tofa", "Gwarzo", "Kabo", "Kunchi", "Makoda", "Rimin Gado", "Shanono", "Tofa", "Tsanyawa"],
    "Kano South": ["Ajingi", "Albasu", "Bebeji", "Bunkure", "Doguwa", "Garko", "Gaya", "Karaye", "Kibiya", "Kiru", "Rano", "Rogo", "Sumaila", "Takai", "Tudun Wada", "Wudil"]
  },
  "Katsina": {
    "Katsina Central": ["Batagarawa", "Batsari", "Charanchi", "Dan Musa", "Dutsin Ma", "Jibia", "Kaita", "Katsina", "Kurfi", "Rimi", "Safana"],
    "Katsina North": ["Baure", "Bindawa", "Daura", "Dutsi", "Ingawa", "Kankia", "Kusada", "Mai'Adua", "Mani", "Mashi", "Sandamu", "Zango"],
    "Katsina South": ["Bakori", "Dandume", "Danja", "Faskari", "Funtua", "Kafur", "Kankara", "Malumfashi", "Matazu", "Musawa", "Sabuwa"]
  },
  "Kebbi": {
    "Kebbi Central": ["Aleiro", "Birnin Kebbi", "Bunza", "Gwandu", "Jega", "Kalgo", "Koko/Besse", "Maiyama"],
    "Kebbi North": ["Arewa Dandi", "Argungu", "Augie", "Bagudo", "Dandi", "Suru"],
    "Kebbi South": ["Fakai", "Ngaski", "Sakaba", "Shanga", "Wasagu/Danko", "Yauri", "Zuru"]
  },
  "Kogi": {
    "Kogi Central": ["Adavi", "Ajaokuta", "Ogori/Magongo", "Okehi", "Okene"],
    "Kogi East": ["Ankpa", "Bassa", "Dekina", "Ibaji", "Idah", "Igalamela-Odolu", "Ofu", "Olamaboro", "Omala"],
    "Kogi West": ["Ijumu", "Kabba/Bunu", "Kogi", "Lokoja", "Mopa-Muro", "Yagba East", "Yagba West"]
  },
  "Kwara": {
    "Kwara Central": ["Asa", "Ilorin East", "Ilorin South", "Ilorin West"],
    "Kwara North": ["Baruten", "Edu", "Kaiama", "Moro", "Pategi"],
    "Kwara South": ["Ekiti", "Ifelodun", "Irepodun", "Isin", "Offa", "Oke-Ero", "Oyun"]
  },
  "Lagos": {
    "Lagos Central": ["Apapa", "Eti-Osa", "Lagos Island", "Lagos Mainland", "Surulere"],
    "Lagos East": ["Epe", "Ibeju-Lekki", "Ikorodu", "Kosofe", "Shomolu"],
    "Lagos West": ["Agege", "Ajeromi-Ifelodun", "Alimosho", "Amuwo-Odofin", "Badagry", "Ifako-Ijaye", "Ikeja", "Mushin", "Ojo", "Oshodi-Isolo"]
  },
  "Nasarawa": {
    "Nasarawa North": ["Akwanga", "Nasarawa Eggon", "Wamba"],
    "Nasarawa South": ["Awe", "Doma", "Keana", "Lafia", "Obi"],
    "Nasarawa West": ["Karu", "Keffi", "Kokona", "Nasarawa", "Toto"]
  },
  "Niger": {
    "Niger East": ["Bosso", "Chanchaga", "Gurara", "Muya", "Paikoro", "Rafi", "Shiroro", "Suleja", "Tafa"],
    "Niger North": ["Agwara", "Borgu", "Kontagora", "Magama", "Mariga", "Mashegu", "Rijau", "Wushishi"],
    "Niger South": ["Agaie", "Bida", "Edati", "Gbako", "Katcha", "Lapai", "Lavun", "Mokwa"]
  },
  "Ogun": {
    "Ogun Central": ["Abeokuta North", "Abeokuta South", "Ewekoro", "Ifo", "Obafemi Owode", "Odeda"],
    "Ogun East": ["Ijebu East", "Ijebu North", "Ijebu North East", "Ijebu Ode", "Ikenne", "Odogbolu", "Ogun Waterside", "Remo North", "Shagamu"],
    "Ogun West": ["Ado-Odo/Ota", "Egbado North", "Egbado South", "Imeko Afon", "Ipokia"]
  },
  "Ondo": {
    "Ondo Central": ["Akure North", "Akure South", "Idanre", "Ifedore", "Ondo East", "Ondo West"],
    "Ondo North": ["Akoko North-East", "Akoko North-West", "Akoko South-East", "Akoko South-West", "Ose", "Owo"],
    "Ondo South": ["Ese Odo", "Ilaje", "Ile Oluji/Okeigbo", "Irele", "Odigbo", "Okitipupa"]
  },
  "Osun": {
    "Osun Central": ["Boluwaduro", "Boripe", "Ifedayo", "Ifelodun", "Ila", "Irepodun", "Odo Otin", "Olorunda", "Orolu", "Osogbo"],
    "Osun East": ["Atakunmosa East", "Atakunmosa West", "Ife Central", "Ife East", "Ife North", "Ife South", "Ilesa East", "Ilesa West", "Obokun", "Oriade"],
    "Osun West": ["Aiyedaade", "Aiyedire", "Ede North", "Ede South", "Egbedore", "Ejigbo", "Irewole", "Isokan", "Iwo", "Ola Oluwa"]
  },
  "Oyo": {
    "Oyo Central": ["Afijio", "Akinyele", "Atiba", "Egbeda", "Lagelu", "Ogo Oluwa", "Oluyole", "Ona Ara", "Oyo East", "Oyo West", "Surulere"],
    "Oyo North": ["Atisbo", "Irepo", "Iseyin", "Itesiwaju", "Iwajowa", "Kajola", "Ogbomoso North", "Ogbomoso South", "Olorunsogo", "Orelope", "Ori Ire", "Saki East", "Saki West"],
    "Oyo South": ["Ibadan North", "Ibadan North-East", "Ibadan North-West", "Ibadan South-East", "Ibadan South-West", "Ibarapa Central", "Ibarapa East", "Ibarapa North", "Ido"]
  },
  "Plateau": {
    "Plateau Central": ["Bokkos", "Kanam", "Kanke", "Mangu", "Pankshin"],
    "Plateau North": ["Barkin Ladi", "Bassa", "Jos East", "Jos North", "Jos South", "Riyom"],
    "Plateau South": ["Langtang North", "Langtang South", "Mikang", "Qua'an Pan", "Shendam", "Wase"]
  },
  "Rivers": {
    "Rivers East": ["Emohua", "Etche", "Ikwerre", "Obio/Akpor", "Ogu/Bolo", "Okrika", "Omuma", "Port Harcourt"],
    "Rivers South East": ["Andoni", "Eleme", "Gokana", "Khana", "Opobo/Nkoro", "Oyigbo", "Tai"],
    "Rivers West": ["Abua/Odual", "Ahoada East", "Ahoada West", "Akuku-Toru", "Asari-Toru", "Bonny", "Degema", "Ogba/Egbema/Ndoni"]
  },
  "Sokoto": {
    "Sokoto East": ["Gada", "Goronyo", "Gwadabawa", "Illela", "Isa", "Rabah", "Sabon Birni", "Wurno"],
    "Sokoto North": ["Binji", "Gudu", "Kware", "Silame", "Sokoto North", "Sokoto South", "Tangaza", "Wamako"],
    "Sokoto South": ["Bodinga", "Dange-Shuni", "Kebbe", "Shagari", "Tambuwal", "Tureta", "Yabo"]
  },
  "Taraba": {
    "Taraba Central": ["Bali", "Gashaka", "Gassol", "Kurmi", "Sardauna"],
    "Taraba North": ["Ardo Kola", "Jalingo", "Karim Lamido", "Lau", "Yorro", "Zing"],
    "Taraba South": ["Donga", "Ibi", "Takum", "Ussa", "Wukari"]
  },
  "Yobe": {
    "Yobe East": ["Bursari", "Damaturu", "Geidam", "Gujba", "Gulani", "Tarmuwa", "Yunusari"],
    "Yobe North": ["Bade", "Jakusko", "Karasuwa", "Machina", "Nguru", "Yusufari"],
    "Yobe South": ["Fika", "Fune", "Nangere", "Potiskum"]
  },
  "Zamfara": {
    "Zamfara Central": ["Bungudu", "Gusau", "Maru", "Tsafe"],
    "Zamfara North": ["Birnin Magaji/Kiyaw", "Kaura Namoda", "Shinkafi", "Zurmi"],
    "Zamfara West": ["Anka", "Bakura", "Bukkuyum", "Gummi", "Maradun", "Talata Mafara"]
  }
}

export const FEDERAL_CONSTITUENCY_LGAS: Record<string, Record<string, string[]>> = {
  "Abia": {
    "Aba North/Aba South": ["Aba North", "Aba South"],
    "Arochukwu/Ohafia": ["Arochukwu", "Ohafia"],
    "Bende": ["Bende"],
    "Isiala Ngwa North/Isiala Ngwa South": ["Isiala Ngwa North", "Isiala Ngwa South"],
    "Isuikwuato/Umunneochi": ["Isuikwuato", "Umu-Nneochi"],
    "Obingwa/Ugwunagbo/Osisioma": ["Obingwa", "Osisioma", "Ugwunagbo"],
    "Ukwa East/Ukwa West": ["Ukwa East", "Ukwa West"],
    "Umuahia North/Umuahia South/Ikwuano": ["Ikwuano", "Umuahia North", "Umuahia South"]
  },
  "Adamawa": {
    "Demsa/Numan/Lamurde": ["Demsa", "Lamurde", "Numan"],
    "Fufore/Song": ["Fufore", "Song"],
    "Guyuk/Shelleng": ["Guyuk", "Shelleng"],
    "Hong/Gombi": ["Gombi", "Hong"],
    "Jada/Ganye/Mayo Belwa/Toungo": ["Ganye", "Jada", "Mayo-Belwa", "Toungo"],
    "Michika/Madagali": ["Madagali", "Michika"],
    "Mubi North/Mubi South/Maiha": ["Maiha", "Mubi North", "Mubi South"],
    "Yola North/Yola South/Girei": ["Girei", "Yola North", "Yola South"]
  },
  "Akwa Ibom": {
    "Abak/Etim Ekpo/Ika": ["Abak", "Etim Ekpo", "Ika"],
    "Eket/Onna/Esit Eket/Ibeno": ["Eket", "Esit Eket", "Ibeno", "Onna"],
    "Etinan/Nsit Ibom/Nsit ubium": ["Etinan", "Nsit Ibom", "Nsit Ubium"],
    "Ikono/Ini": ["Ikono", "Ini"],
    "Ikot Abasi/Mkpat Enin/Eastern Obolo": ["Eastern Obolo", "Ikot Abasi", "Mkpat Enin"],
    "Ikot Ekpene/Essien Udim/Obot Akara": ["Essien Udim", "Ikot Ekpene", "Obot Akara"],
    "Itu/Ibiono Ibom": ["Ibiono Ibom", "Itu"],
    "Oron/Mbo/Okobo/Udung Uko/Urue Offong/Oruko": ["Mbo", "Okobo", "Oron", "Udung Uko", "Urue Offong/Oruko"],
    "Ukanafun/Oruk Anam": ["Oruk Anam", "Ukanafun"],
    "Uyo/Uruan/Nsit Atai/Ibesikpo Asutan": ["Ibesikpo/Asutan", "Nsit Atai", "Uruan", "Uyo"]
  },
  "Anambra": {
    "Aguata": ["Aguata"],
    "Anambra East/West": ["Anambra East", "Anambra West"],
    "Awka North/South": ["Awka North", "Awka South"],
    "Idemili North/South": ["Idemili North", "Idemili South"],
    "Ihiala": ["Ihiala"],
    "Njikoka/Dunukofia/Anaocha": ["Anaocha", "Dunukofia", "Njikoka"],
    "Nnewi North/South/Ekwusigo": ["Ekwusigo", "Nnewi North", "Nnewi South"],
    "Ogbaru": ["Ogbaru"],
    "Onitsha North/South": ["Onitsha North", "Onitsha South"],
    "Orumba North/South": ["Orumba North", "Orumba South"],
    "Oyi/Ayamelum": ["Ayamelum", "Oyi"]
  },
  "Bauchi": {
    "Alkaleri/Kirfi": ["Alkaleri", "Kirfi"],
    "Bauchi": ["Bauchi"],
    "Bogoro/Dass/Tafawa Balewa": ["Bogoro", "Dass", "Tafawa Balewa"],
    "Darazo/Gunjuwa": ["Darazo", "Ganjuwa"],
    "Gamawa": ["Gamawa"],
    "Jama'are/Itas-Gadau": ["Itas/Gadau", "Jama'are"],
    "Katagum": ["Katagum"],
    "Misau/Dambam": ["Damban", "Misau"],
    "Ningi/Warji": ["Ningi", "Warji"],
    "Shira/Giade": ["Giade", "Shira"],
    "Toro": ["Toro"],
    "Zaki": ["Zaki"]
  },
  "Bayelsa": {
    "Brass/Nembe": ["Brass", "Nembe"],
    "Ogbia": ["Ogbia"],
    "Sagbama/Ekeremor": ["Ekeremor", "Sagbama"],
    "Southern Ijaw": ["Southern Ijaw"],
    "Yenagoa/Kolokuma/Opokuma": ["Kolokuma/Opokuma", "Yenagoa"]
  },
  "Benue": {
    "Ado/Obadigbo/Okpokwu": ["Ado", "Ogbadibo", "Okpokwu"],
    "Apa/Agatu": ["Agatu", "Apa"],
    "Buruku": ["Buruku"],
    "Gboko/Tarka": ["Gboko", "Tarka"],
    "Guma/Makurdi": ["Guma", "Makurdi"],
    "Gwer East/Gwer West": ["Gwer East", "Gwer West"],
    "Katsina-Ala/Ukum/Logo": ["Katsina-Ala", "Logo", "Ukum"],
    "Konshisha/Vandeikya": ["Konshisha", "Vandeikya"],
    "Kwande/Ushongo": ["Kwande", "Ushongo"],
    "Oju/Obi": ["Obi", "Oju"],
    "Otukpo/Ohimini": ["Ohimini", "Otukpo"]
  },
  "Borno": {
    "Askira-Uba/Hawul": ["Askira/Uba", "Hawul"],
    "Bama/Ngala/Kala-Balge": ["Bama", "Kala Balge", "Ngala"],
    "Biu/Kwaya Kusar/Shani/Bayo": ["Bayo", "Biu", "Kwaya Kusar", "Shani"],
    "Damboa/Gwoza/Chibok": ["Chibok", "Damboa", "Gwoza"],
    "Dikwa/Mafa/Konduga": ["Dikwa", "Konduga", "Mafa"],
    "Jere": ["Jere"],
    "Kaga/Gubio/Magumeri": ["Gubio", "Kaga", "Magumeri"],
    "Kukawa/Mobbar/Abadam/Guzamali": ["Abadam", "Guzamala", "Kukawa", "Mobbar"],
    "Maiduguri Metropolitan": ["Maiduguri"],
    "Monguno/Nganzai/Marte": ["Marte", "Monguno", "Nganzai"]
  },
  "Cross River": {
    "Akamkpa/Biase": ["Akamkpa", "Biase"],
    "Boki/Ikom": ["Boki", "Ikom"],
    "Calabar Municipal/Odukpani": ["Calabar Municipality", "Odukpani"],
    "Calabar South/Akpabuyo/Bakassi": ["Akpabuyo", "Bakassi", "Calabar South"],
    "Obanliku/Obudu/Bekwarra": ["Bekwarra", "Obanliku", "Obudu"],
    "Obubra/Etung": ["Etung", "Obubra"],
    "Ogoja/Yala": ["Ogoja", "Yala"],
    "Yakurr/Abi": ["Abi", "Yakurr"]
  },
  "Delta": {
    "Aniocha North/Aniocha South/Oshimili North/Oshimili South": ["Aniocha North", "Aniocha South", "Oshimili North", "Oshimili South"],
    "Bomadi/Patani": ["Bomadi", "Patani"],
    "Burutu": ["Burutu"],
    "Ethiope East/Ethiope West": ["Ethiope East", "Ethiope West"],
    "Ika North East/Ika South": ["Ika North East", "Ika South"],
    "Isoko North/Isoko South": ["Isoko North", "Isoko South"],
    "Ndokwa East/Ndokwa West/Ukwuani": ["Ndokwa East", "Ndokwa West", "Ukwuani"],
    "Okpe/Sapele/Uvwie": ["Okpe", "Sapele", "Uvwie"],
    "Ughelli North/Ughelli South/Udu": ["Udu", "Ughelli North", "Ughelli South"],
    "Warri North/Warri South/Warri South West": ["Warri North", "Warri South", "Warri South West"]
  },
  "Ebonyi": {
    "Abakaliki/Izzi": ["Abakaliki", "Izzi"],
    "Afikpo North/Afikpo South": ["Afikpo North", "Afikpo South"],
    "Ebonyi/Ohaukwu": ["Ebonyi", "Ohaukwu"],
    "Ezza North/Ishielu": ["Ezza North", "Ishielu"],
    "Ezza South/Ikwo": ["Ezza South", "Ikwo"],
    "Ivo/Ohaozara/Onicha": ["Ivo", "Ohaozara", "Onicha"]
  },
  "Edo": {
    "Akoko-Edo": ["Akoko Edo"],
    "Egor/Ikpoba-Okha": ["Egor", "Ikpoba Okha"],
    "Esan Central/Esan West/Igueben": ["Esan Central", "Esan West", "Igueben"],
    "Esan North East/Esan South East": ["Esan North East", "Esan South East"],
    "Etsako East/Etsako West/Etsako Central": ["Etsako Central", "Etsako East", "Etsako West"],
    "Oredo": ["Oredo"],
    "Orhionmwon/Uhunmwonde": ["Orhionmwon", "Uhunmwonde"],
    "Ovia North East/Ovia South West": ["Ovia North East", "Ovia South West"],
    "Owan East/Owan West": ["Owan East", "Owan West"]
  },
  "Ekiti": {
    "Ado Ekiti/Irepodun/Ifelodun": ["Ado Ekiti", "Irepodun/Ifelodun"],
    "Ekiti South West/Ikere/Orun/Ise": ["Ekiti South West", "Ikere", "Ise/Orun"],
    "Emure/Gbonyin/Ekiti East": ["Ekiti East", "Emure", "Gbonyin"],
    "Ido/Osi/Moba/Ilejemeje": ["Ido/Osi", "Ilejemeje", "Moba"],
    "Ijero/Ekiti West/Efon": ["Efon", "Ekiti West", "Ijero"],
    "Ikole/Oye": ["Ikole", "Oye"]
  },
  "Enugu": {
    "Aninri/Awgu/Oji River": ["Aninri", "Awgu", "Oji River"],
    "Enugu East/Isi Uzo": ["Enugu East", "Isi Uzo"],
    "Enugu North/Enugu South": ["Enugu North", "Enugu South"],
    "Ezeagu/Udi": ["Ezeagu", "Udi"],
    "Igbo-Etiti/Uzo-Uwani": ["Igbo Etiti", "Uzo Uwani"],
    "Igbo-Eze North/Udenu": ["Igbo Eze North", "Udenu"],
    "Nkanu East/Nkanu West": ["Nkanu East", "Nkanu West"],
    "Nsukka/Igbo-Eze South": ["Igbo Eze South", "Nsukka"]
  },
  "FCT Abuja": {
    "Abaji/Kuje/Kwali/Gwagwalada": ["Abaji", "Gwagwalada", "Kuje", "Kwali"],
    "Abuja Municipal/Bwari": ["Abuja Municipal", "Bwari"]
  },
  "Gombe": {
    "Akko": ["Akko"],
    "Balanga/Billiri": ["Balanga", "Billiri"],
    "Dukku/Nafada": ["Dukku", "Nafada"],
    "Gombe/Kwami/Funakaye": ["Funakaye", "Gombe", "Kwami"],
    "Kaltungo/Shongom": ["Kaltungo", "Shongom"],
    "Yamaltu/Deba": ["Yamaltu/Deba"]
  },
  "Imo": {
    "Aboh Mbaise/Ngor Okpala": ["Aboh Mbaise", "Ngor Okpala"],
    "Ahiazu Mbaise/Ezinihitte": ["Ahiazu Mbaise", "Ezinihitte"],
    "Ehime Mbano/Ihite-Uboma/Obowo": ["Ehime Mbano", "Ihitte/Uboma", "Obowo"],
    "Ideato North/Ideato South": ["Ideato North", "Ideato South"],
    "Ikeduru/Mbaitoli": ["Ikeduru", "Mbaitoli"],
    "Isiala Mbano/Okigwe/Onuimo": ["Isiala Mbano", "Okigwe", "Unuimo"],
    "Isu/Njaba/Nkwerre/Nwangele": ["Isu", "Njaba", "Nkwerre", "Nwangele"],
    "Oguta/Ohaji-Egbema/Oru West": ["Oguta", "Ohaji/Egbema", "Oru West"],
    "Oru East/Orsu/Orlu": ["Orlu", "Orsu", "Oru East"],
    "Owerri Municipal/Owerri North/Owerri West": ["Owerri Municipal", "Owerri North", "Owerri West"]
  },
  "Jigawa": {
    "Babura/Garki": ["Babura", "Garki"],
    "Birnin Kudu/Buji": ["Birnin Kudu", "Buji"],
    "Birniwa/Guri/Kirikasamma": ["Biriniwa", "Guri", "Kiri Kasamma"],
    "Dutse/Kiyawa": ["Dutse", "Kiyawa"],
    "Gumel/Maigatari/Sule Tankarkar/Gagarawa": ["Gagarawa", "Gumel", "Maigatari", "Sule Tankarkar"],
    "Gwaram": ["Gwaram"],
    "Hadejia/Auyo/Kafin Hausa": ["Auyo", "Hadejia", "Kafin Hausa"],
    "Jahun/Miga": ["Jahun", "Miga"],
    "Kazaure/Roni/Gwiwa/Yankwashi": ["Gwiwa", "Kazaure", "Roni", "Yankwashi"],
    "Mallam Madori/Kaugama": ["Kaugama", "Malam Madori"],
    "Ringim/Taura": ["Ringim", "Taura"]
  },
  "Kaduna": {
    "Birnin Gwari/Giwa": ["Birnin Gwari", "Giwa"],
    "Chikun/Kajuru": ["Chikun", "Kajuru"],
    "Igabi": ["Igabi"],
    "Ikara/Kubau": ["Ikara", "Kubau"],
    "Jemaa/Sanga": ["Jema'a", "Sanga"],
    "Kachia/Kagarko": ["Kachia", "Kagarko"],
    "Kaduna North": ["Kaduna North"],
    "Kaduna South": ["Kaduna South"],
    "Kaura": ["Kaura"],
    "Kauru": ["Kauru"],
    "Lere": ["Lere"],
    "Makarfi/Kudan": ["Kudan", "Makarfi"],
    "Sabon Gari": ["Sabon Gari"],
    "Soba": ["Soba"],
    "Zangon Kataf/Jaba": ["Jaba", "Zangon Kataf"],
    "Zaria": ["Zaria"]
  },
  "Kano": {
    "Alabasu/Gaya/Ajingi": ["Ajingi", "Albasu", "Gaya"],
    "Bagwai/Shanono": ["Bagwai", "Shanono"],
    "Bebeji/Kiru": ["Bebeji", "Kiru"],
    "Bichi": ["Bichi"],
    "Dala": ["Dala"],
    "Dambatta/Makoda": ["Dambatta", "Makoda"],
    "Dawakin Kudu/Warawa": ["Dawakin Kudu", "Warawa"],
    "Dawakin Tofa/Tofa/Rimin Gado": ["Dawakin Tofa", "Rimin Gado", "Tofa"],
    "Doguwa/Tudun Wada": ["Doguwa", "Tudun Wada"],
    "Fagge": ["Fagge"],
    "Gezawa/Gabasawa": ["Gabasawa", "Gezawa"],
    "Gwale": ["Gwale"],
    "Gwarzo/Ikabo": ["Gwarzo", "Kabo"],
    "Kano Municipal": ["Kano Municipal"],
    "Karaye/Rogo": ["Karaye", "Rogo"],
    "Kumbotso": ["Kumbotso"],
    "Kura/Madobi/Garun Mallam": ["Garun Mallam", "Kura", "Madobi"],
    "Minjibir/Ungogo": ["Minjibir", "Ungogo"],
    "Nassarawa": ["Nasarawa"],
    "Rano/Bunkure/Kibiya": ["Bunkure", "Kibiya", "Rano"],
    "Sumaila/Takai": ["Sumaila", "Takai"],
    "Tarauni": ["Tarauni"],
    "Tsanyawa/Kunchi": ["Kunchi", "Tsanyawa"],
    "Wudil/Garko": ["Garko", "Wudil"]
  },
  "Katsina": {
    "Bakori/Danja": ["Bakori", "Danja"],
    "Batagarawa/Charanchi/Rimi": ["Batagarawa", "Charanchi", "Rimi"],
    "Batsari/Safana/Danmusa": ["Batsari", "Dan Musa", "Safana"],
    "Bindawa/Mani": ["Bindawa", "Mani"],
    "Daura/Sandamu/Maiadua": ["Daura", "Mai'Adua", "Sandamu"],
    "Dutsin-Ma/Kurfi": ["Dutsin Ma", "Kurfi"],
    "Faskari/Kankara/Sabuwa": ["Faskari", "Kankara", "Sabuwa"],
    "Funtua/Dandume": ["Dandume", "Funtua"],
    "Ingawa/Kankia/Kusada": ["Ingawa", "Kankia", "Kusada"],
    "Jibia/Kaita": ["Jibia", "Kaita"],
    "Katsina": ["Katsina"],
    "Malumfashi/Kafur": ["Kafur", "Malumfashi"],
    "Mashi/Dutsi": ["Dutsi", "Mashi"],
    "Matazu/Musawa": ["Matazu", "Musawa"],
    "Zango/Baure": ["Baure", "Zango"]
  },
  "Kebbi": {
    "Aleiro/Gwandu/Jega": ["Aleiro", "Gwandu", "Jega"],
    "Arewa/Dandi": ["Arewa Dandi", "Dandi"],
    "Argungu/Augie": ["Argungu", "Augie"],
    "Bagudo/Suru": ["Bagudo", "Suru"],
    "Bunza/Birnin Kebbi/Kalgo": ["Birnin Kebbi", "Bunza", "Kalgo"],
    "Fakai/Sakaba/Wasagu/Danko/Zuru": ["Fakai", "Sakaba", "Wasagu/Danko", "Zuru"],
    "Koko-Besse/Maiyama": ["Koko/Besse", "Maiyama"],
    "Ngaski/Shanga/Yauri": ["Ngaski", "Shanga", "Yauri"]
  },
  "Kogi": {
    "Adavi/Okehi": ["Adavi", "Okehi"],
    "Ajaokuta": ["Ajaokuta"],
    "Ankpa/Omala/Olamaboro": ["Ankpa", "Olamaboro", "Omala"],
    "Bassa/Dekina": ["Bassa", "Dekina"],
    "Idah/Igalamela Odolu/Ibaji/Ofu": ["Ibaji", "Idah", "Igalamela-Odolu", "Ofu"],
    "Ijumu/Kabba-Bunu": ["Ijumu", "Kabba/Bunu"],
    "Lokoja/Koton Karfe": ["Kogi", "Lokoja"],
    "Okene/Ogori-Magogo": ["Ogori/Magongo", "Okene"],
    "Yagba East/Yagba West/Mopamuro": ["Mopa-Muro", "Yagba East", "Yagba West"]
  },
  "Kwara": {
    "Baruten/Kaiama": ["Baruten", "Kaiama"],
    "Edu/Moro/Pategi": ["Edu", "Moro", "Pategi"],
    "Ekiti/Isin/Irepodun/Oke-Ero": ["Ekiti", "Irepodun", "Isin", "Oke-Ero"],
    "Ifelodun/Offa/Oyun": ["Ifelodun", "Offa", "Oyun"],
    "Ilorin East/Ilorin South": ["Ilorin East", "Ilorin South"],
    "Ilorin West/Asa": ["Asa", "Ilorin West"]
  },
  "Lagos": {
    "Agege": ["Agege"],
    "Ajeromi/Ifelodun": ["Ajeromi-Ifelodun"],
    "Alimosho": ["Alimosho"],
    "Amuwo-Odofin": ["Amuwo-Odofin"],
    "Apapa": ["Apapa"],
    "Badagry": ["Badagry"],
    "Epe": ["Epe"],
    "Eti-Osa": ["Eti-Osa"],
    "Ibeju Lekki": ["Ibeju-Lekki"],
    "Ifako-Ijaiye": ["Ifako-Ijaye"],
    "Ikeja": ["Ikeja"],
    "Ikorodu": ["Ikorodu"],
    "Kosofe": ["Kosofe"],
    "Lagos Island I": ["Lagos Island"],
    "Lagos Island II": ["Lagos Island"],
    "Lagos Mainland": ["Lagos Mainland"],
    "Mushin I": ["Mushin"],
    "Mushin II": ["Mushin"],
    "Ojo": ["Ojo"],
    "Oshodi/Isolo I": ["Oshodi-Isolo"],
    "Oshodi/Isolo II": ["Oshodi-Isolo"],
    "Shomolu": ["Shomolu"],
    "Surulere I": ["Surulere"],
    "Surulere II": ["Surulere"]
  },
  "Nasarawa": {
    "Akwanga/Nassarawa Eggon/Wamba": ["Akwanga", "Nasarawa Eggon", "Wamba"],
    "Awe/Doma/Keana": ["Awe", "Doma", "Keana"],
    "Keffi/Karu/Kokona": ["Karu", "Keffi", "Kokona"],
    "Lafia/Obi": ["Lafia", "Obi"],
    "Nassarawa/Toto": ["Nasarawa", "Toto"]
  },
  "Niger": {
    "Agaie/Lapai": ["Agaie", "Lapai"],
    "Agwara/Borgu": ["Agwara", "Borgu"],
    "Bida/Gbako/Katcha": ["Bida", "Gbako", "Katcha"],
    "Booso/Paikoro": ["Bosso", "Paikoro"],
    "Chanchaga": ["Chanchaga"],
    "Gurara/Suleja/Tapa": ["Gurara", "Suleja", "Tafa"],
    "Kontagora/Wushishi/Mariga/Mashegu": ["Kontagora", "Mariga", "Mashegu", "Wushishi"],
    "Lavun/Mokwa/Edati": ["Edati", "Lavun", "Mokwa"],
    "Magama/Rijau": ["Magama", "Rijau"],
    "Shiroro/Rafi/Munya": ["Muya", "Rafi", "Shiroro"]
  },
  "Ogun": {
    "Abeokuta North/Obafemi-Owode/Odeda": ["Abeokuta North", "Obafemi Owode", "Odeda"],
    "Abeokuta South": ["Abeokuta South"],
    "Ado-Odo/Ota": ["Ado-Odo/Ota"],
    "Egbado North/Imeko-Afon": ["Egbado North", "Imeko Afon"],
    "Egbado South/Ipokia": ["Egbado South", "Ipokia"],
    "Ifo/Ewekoro": ["Ewekoro", "Ifo"],
    "Ijebu North/Ijebu East/Ogun Waterside": ["Ijebu East", "Ijebu North", "Ogun Waterside"],
    "Ijebu Ode/Odogbolu/Ijebu North East": ["Ijebu North East", "Ijebu Ode", "Odogbolu"],
    "Ikenne/Shagamu/Remo North": ["Ikenne", "Remo North", "Shagamu"]
  },
  "Ondo": {
    "Akoko North East/Akoko North West": ["Akoko North-East", "Akoko North-West"],
    "Akoko South East/Akoko South West": ["Akoko South-East", "Akoko South-West"],
    "Akure North/Akure South": ["Akure North", "Akure South"],
    "Ese Odo/Ilaje": ["Ese Odo", "Ilaje"],
    "Idanre/Ifedore": ["Idanre", "Ifedore"],
    "Ileoluji/Okeigbo/Odigbo": ["Ile Oluji/Okeigbo", "Odigbo"],
    "Okitipupa/Irele": ["Irele", "Okitipupa"],
    "Ondo East/Ondo West": ["Ondo East", "Ondo West"],
    "Owo/Ose": ["Ose", "Owo"]
  },
  "Osun": {
    "Atakunmosa East/Atakunmosa West/Ilesha East/Ilesha West": ["Atakunmosa East", "Atakunmosa West", "Ilesa East", "Ilesa West"],
    "Ayedaade/Irewole/Isokan": ["Aiyedaade", "Irewole", "Isokan"],
    "Ayedire/Iwo/Ola-Oluwa": ["Aiyedire", "Iwo", "Ola Oluwa"],
    "Boluwaduro/Ifedayo/Ila": ["Boluwaduro", "Ifedayo", "Ila"],
    "Ede North/Ede South/Egbedore/Ejigbo": ["Ede North", "Ede South", "Egbedore", "Ejigbo"],
    "Ife Central/Ife North/Ife South/Ife East": ["Ife Central", "Ife East", "Ife North", "Ife South"],
    "Irepodun/Olorunda/Osogbo/Orolu": ["Irepodun", "Olorunda", "Orolu", "Osogbo"],
    "Obokun/Oriade": ["Obokun", "Oriade"],
    "Odo-Otin/Ifelodun/Boripe": ["Boripe", "Ifelodun", "Odo Otin"]
  },
  "Oyo": {
    "Afijio/Atiba/Oyo East/Oyo West": ["Afijio", "Atiba", "Oyo East", "Oyo West"],
    "Akinyele/Lagelu": ["Akinyele", "Lagelu"],
    "Atisbo/Saki East/Saki West": ["Atisbo", "Saki East", "Saki West"],
    "Egbeda/Ona-Ara": ["Egbeda", "Ona Ara"],
    "Ibadan North": ["Ibadan North"],
    "Ibadan North East/Ibadan South East": ["Ibadan North-East", "Ibadan South-East"],
    "Ibadan North West/Ibadan South West": ["Ibadan North-West", "Ibadan South-West"],
    "Ibarapa Central/Ibarapa North": ["Ibarapa Central", "Ibarapa North"],
    "Ibarapa East/Ido": ["Ibarapa East", "Ido"],
    "Irepo/Olurunsogo/Orelope": ["Irepo", "Olorunsogo", "Orelope"],
    "Iseyin/Kajola/Iwajowa/Itesiwaju": ["Iseyin", "Itesiwaju", "Iwajowa", "Kajola"],
    "Ogbomoso North/Ogbomoso South/Orire": ["Ogbomoso North", "Ogbomoso South", "Ori Ire"],
    "Ogo-Oluwa/Surulere": ["Ogo Oluwa", "Surulere"],
    "Oluyole": ["Oluyole"]
  },
  "Plateau": {
    "Barkin Ladi/Riyom": ["Barkin Ladi", "Riyom"],
    "Bokkos/Mangu": ["Bokkos", "Mangu"],
    "Jos North/Bassa": ["Bassa", "Jos North"],
    "Jos South/Jos East": ["Jos East", "Jos South"],
    "Kanke/Pankshin/Kanam": ["Kanam", "Kanke", "Pankshin"],
    "Langtang North/Langtang South": ["Langtang North", "Langtang South"],
    "Mikang/Qua’an/Pan/Shedam": ["Mikang", "Qua'an Pan", "Shendam"],
    "Wase": ["Wase"]
  },
  "Rivers": {
    "Abua/Odua/Ahoada East": ["Abua/Odual", "Ahoada East"],
    "Ahoada West/Ogba/Egbema/Ndoni": ["Ahoada West", "Ogba/Egbema/Ndoni"],
    "Akuku Toru/Asari Toru": ["Akuku-Toru", "Asari-Toru"],
    "Andoni/Opobo/Nkoro": ["Andoni", "Opobo/Nkoro"],
    "Degema/Bonny": ["Bonny", "Degema"],
    "Eleme/Oyigbo/Tai": ["Eleme", "Oyigbo", "Tai"],
    "Etche/Omuma": ["Etche", "Omuma"],
    "Ikwerre/Emohua": ["Emohua", "Ikwerre"],
    "Khana/Gokana": ["Gokana", "Khana"],
    "Obio/Akpor": ["Obio/Akpor"],
    "Okrika/Ogu/Bolo": ["Ogu/Bolo", "Okrika"],
    "Port Harcourt I": ["Port Harcourt"],
    "Port Harcourt II": ["Port Harcourt"]
  },
  "Sokoto": {
    "Binji/Silame": ["Binji", "Silame"],
    "Dange-Shuni/Bodinga/Tureta": ["Bodinga", "Dange-Shuni", "Tureta"],
    "Goronyo/Gada": ["Gada", "Goronyo"],
    "Illela/Gwadabawa": ["Gwadabawa", "Illela"],
    "Isa/Sabon Birni": ["Isa", "Sabon Birni"],
    "Kebbe/Tambuwal": ["Kebbe", "Tambuwal"],
    "Kware/Wamakko": ["Kware", "Wamako"],
    "Sokoto North/Sokoto South": ["Sokoto North", "Sokoto South"],
    "Tangaza/Gudu": ["Gudu", "Tangaza"],
    "Wurno/Rabah": ["Rabah", "Wurno"],
    "Yabo/Shagari": ["Shagari", "Yabo"]
  },
  "Taraba": {
    "Bali/Gassol": ["Bali", "Gassol"],
    "Jalingo/Yorro/Zing": ["Jalingo", "Yorro", "Zing"],
    "Karim Lamido/Lau/Ardo-Kola": ["Ardo Kola", "Karim Lamido", "Lau"],
    "Sardauna/Gashaka/Kurmi": ["Gashaka", "Kurmi", "Sardauna"],
    "Takum/Donga/Ussa": ["Donga", "Takum", "Ussa"],
    "Wukari/Ibi": ["Ibi", "Wukari"]
  },
  "Yobe": {
    "Bade/Jakusko": ["Bade", "Jakusko"],
    "Bursari/Geidam/Yunusari": ["Bursari", "Geidam", "Yunusari"],
    "Damaturu/Gujba/Gulani/Tarmuwa": ["Damaturu", "Gujba", "Gulani", "Tarmuwa"],
    "Fika/Fune": ["Fika", "Fune"],
    "Machina/Nguru/Yusufari/Karasuwa": ["Karasuwa", "Machina", "Nguru", "Yusufari"],
    "Nangere/Potiskum": ["Nangere", "Potiskum"]
  },
  "Zamfara": {
    "Anka/Talata/Mafara": ["Anka", "Talata Mafara"],
    "Bakura/Maradun": ["Bakura", "Maradun"],
    "Bungudu/Maru": ["Bungudu", "Maru"],
    "Gummi/Bukkuyum": ["Bukkuyum", "Gummi"],
    "Gusau/Tsafe": ["Gusau", "Tsafe"],
    "Kaura Namoda/Birnin Magaji": ["Birnin Magaji/Kiyaw", "Kaura Namoda"],
    "Shinkafi/Zurmi": ["Shinkafi", "Zurmi"]
  }
}

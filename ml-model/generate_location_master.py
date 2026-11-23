"""
HOUSE AI - India-Wide Administrative & Real Estate Location Master Generator
Generates structured location hierarchy for all 28 States and 8 Union Territories of India.
"""
import json
import os
from datetime import datetime, timezone

INDIA_ADMINISTRATIVE_DATA = [
    # ==================== 28 STATES ====================
    {
        "state": "Andhra Pradesh",
        "stateCode": "AP",
        "type": "State",
        "districts": [
            {
                "district": "Visakhapatnam",
                "districtCode": "AP-VSP",
                "cities": [
                    {"city": "Visakhapatnam", "cityCode": "AP-VSP-01", "mlCovered": True, "baseRateSqFt": 5800, "localities": ["Madhurawada", "MVP Colony", "Gajuwaka", "Seethammadhara", "Rushikonda", "Dwaraka Nagar", "Pendurthi"]},
                    {"city": "Bheemunipatnam", "cityCode": "AP-VSP-02", "mlCovered": False, "baseRateSqFt": 3900, "localities": ["Bheemili Beach Road", "Tagarapuvalasa", "Anandapuram"]}
                ]
            },
            {
                "district": "NTR",
                "districtCode": "AP-NTR",
                "cities": [
                    {"city": "Vijayawada", "cityCode": "AP-NTR-01", "mlCovered": True, "baseRateSqFt": 5600, "localities": ["Benz Circle", "Gollapudi", "Patamata", "Auto Nagar", "Bhavanipuram", "Poranki", "Kanuru"]},
                    {"city": "Nandigama", "cityCode": "AP-NTR-02", "mlCovered": False, "baseRateSqFt": 3100, "localities": ["Main Bazaar", "Gandhi Nagar"]}
                ]
            },
            {
                "district": "Guntur",
                "districtCode": "AP-GNT",
                "cities": [
                    {"city": "Guntur", "cityCode": "AP-GNT-01", "mlCovered": True, "baseRateSqFt": 4700, "localities": ["Lakshmipuram", "Brodipet", "Arundelpet", "Vidyanagar", "Gorantla"]},
                    {"city": "Mangalagiri", "cityCode": "AP-GNT-02", "mlCovered": True, "baseRateSqFt": 5100, "localities": ["AIIMS Road", "Atmakur", "NRI Junction"]}
                ]
            },
            {
                "district": "Tirupati",
                "districtCode": "AP-TPT",
                "cities": [
                    {"city": "Tirupati", "cityCode": "AP-TPT-01", "mlCovered": True, "baseRateSqFt": 5200, "localities": ["Alipiri Road", "Tiruchanur", "Renigunta Road", "Bairagipatteda", "MR Palli"]}
                ]
            },
            {
                "district": "Kurnool",
                "districtCode": "AP-KNL",
                "cities": [
                    {"city": "Kurnool", "cityCode": "AP-KNL-01", "mlCovered": False, "baseRateSqFt": 3700, "localities": ["Nandyal Checkpost", "Budhwarpet", "Kallur", "Bellary Chowrasta"]}
                ]
            },
            {
                "district": "Kakinada",
                "districtCode": "AP-KKD",
                "cities": [
                    {"city": "Kakinada", "cityCode": "AP-KKD-01", "mlCovered": False, "baseRateSqFt": 4200, "localities": ["Bhanugudi Junction", "Sarpavaram", "Ramanayyapeta"]}
                ]
            }
        ]
    },
    {
        "state": "Arunachal Pradesh",
        "stateCode": "AR",
        "type": "State",
        "districts": [
            {
                "district": "Papum Pare",
                "districtCode": "AR-PP",
                "cities": [
                    {"city": "Itanagar", "cityCode": "AR-PP-01", "mlCovered": False, "baseRateSqFt": 3800, "localities": ["Ganga Market", "Bank Tinali", "Chandranagar", "Chimpu"]},
                    {"city": "Naharlagun", "cityCode": "AR-PP-02", "mlCovered": False, "baseRateSqFt": 3600, "localities": ["Barapani", "Model Village", "Polo Colony"]}
                ]
            },
            {
                "district": "Tawang",
                "districtCode": "AR-TW",
                "cities": [
                    {"city": "Tawang", "cityCode": "AR-TW-01", "mlCovered": False, "baseRateSqFt": 3400, "localities": ["Old Market", "Nehru Market", "Lebrang"]}
                ]
            },
            {
                "district": "East Siang",
                "districtCode": "AR-ES",
                "cities": [
                    {"city": "Pasighat", "cityCode": "AR-ES-01", "mlCovered": False, "baseRateSqFt": 3300, "localities": ["Banskota", "Mirbuk", "Gumin Nagar"]}
                ]
            }
        ]
    },
    {
        "state": "Assam",
        "stateCode": "AS",
        "type": "State",
        "districts": [
            {
                "district": "Kamrup Metropolitan",
                "districtCode": "AS-KM",
                "cities": [
                    {"city": "Guwahati", "cityCode": "AS-KM-01", "mlCovered": True, "baseRateSqFt": 5400, "localities": ["Beltola", "Six Mile", "Dispur", "Zoo Road", "Paltan Bazaar", "Kahilipara", "Maligaon", "Chandmari"]},
                    {"city": "North Guwahati", "cityCode": "AS-KM-02", "mlCovered": False, "baseRateSqFt": 3800, "localities": ["Amingaon", "Gauripur"]}
                ]
            },
            {
                "district": "Dibrugarh",
                "districtCode": "AS-DB",
                "cities": [
                    {"city": "Dibrugarh", "cityCode": "AS-DB-01", "mlCovered": False, "baseRateSqFt": 3700, "localities": ["Chowkidinghee", "Mancotta Road", "Paltan Bazar", "Boiragimoth"]}
                ]
            },
            {
                "district": "Cachar",
                "districtCode": "AS-CC",
                "cities": [
                    {"city": "Silchar", "cityCode": "AS-CC-01", "mlCovered": False, "baseRateSqFt": 3500, "localities": ["Tarapur", "Malugram", "Rangirkhari", "Ambikapatty"]}
                ]
            },
            {
                "district": "Jorhat",
                "districtCode": "AS-JR",
                "cities": [
                    {"city": "Jorhat", "cityCode": "AS-JR-01", "mlCovered": False, "baseRateSqFt": 3600, "localities": ["Gar-Ali", "Tarajan", "Club Road", "Cinnamara"]}
                ]
            }
        ]
    },
    {
        "state": "Bihar",
        "stateCode": "BR",
        "type": "State",
        "districts": [
            {
                "district": "Patna",
                "districtCode": "BR-PT",
                "cities": [
                    {"city": "Patna", "cityCode": "BR-PT-01", "mlCovered": True, "baseRateSqFt": 6100, "localities": ["Boring Road", "Kankarbagh", "Bailey Road", "Danapur", "Rajendra Nagar", "Patliputra Colony", "Phulwari Sharif", "Digha"]},
                    {"city": "Bihta", "cityCode": "BR-PT-02", "mlCovered": True, "baseRateSqFt": 3900, "localities": ["IIT Bihta Road", "Amhara", "Station Road"]}
                ]
            },
            {
                "district": "Gaya",
                "districtCode": "BR-GY",
                "cities": [
                    {"city": "Gaya", "cityCode": "BR-GY-01", "mlCovered": False, "baseRateSqFt": 4100, "localities": ["AP Colony", "Swarajpuri Road", "Delha", "Civil Lines"]},
                    {"city": "Bodh Gaya", "cityCode": "BR-GY-02", "mlCovered": False, "baseRateSqFt": 4300, "localities": ["Domuhan Road", "Miya Bigha", "Mastipur"]}
                ]
            },
            {
                "district": "Muzaffarpur",
                "districtCode": "BR-MZ",
                "cities": [
                    {"city": "Muzaffarpur", "cityCode": "BR-MZ-01", "mlCovered": False, "baseRateSqFt": 4000, "localities": ["Mithanpura", "Kalambagh Road", "Zero Mile", "Bhagwanpur"]}
                ]
            },
            {
                "district": "Bhagalpur",
                "districtCode": "BR-BG",
                "cities": [
                    {"city": "Bhagalpur", "cityCode": "BR-BG-01", "mlCovered": False, "baseRateSqFt": 3800, "localities": ["Tilkamanjhi", "Adampur", "Zero Mile", "Nathnagar"]}
                ]
            }
        ]
    },
    {
        "state": "Chhattisgarh",
        "stateCode": "CG",
        "type": "State",
        "districts": [
            {
                "district": "Raipur",
                "districtCode": "CG-RP",
                "cities": [
                    {"city": "Raipur", "cityCode": "CG-RP-01", "mlCovered": True, "baseRateSqFt": 4300, "localities": ["Shankar Nagar", "Telibandha", "VIP Road", "Devendra Nagar", "Pandri", "Tatibandh", "Kamal Vihar"]},
                    {"city": "Nava Raipur", "cityCode": "CG-RP-02", "mlCovered": True, "baseRateSqFt": 4500, "localities": ["Sector 27", "Sector 19", "Sector 29", "Rakhi"]}
                ]
            },
            {
                "district": "Durg",
                "districtCode": "CG-DG",
                "cities": [
                    {"city": "Bhilai", "cityCode": "CG-DG-01", "mlCovered": True, "baseRateSqFt": 3800, "localities": ["Nehru Nagar", "Smriti Nagar", "Supela", "Risali", "Civic Centre"]},
                    {"city": "Durg", "cityCode": "CG-DG-02", "mlCovered": False, "baseRateSqFt": 3500, "localities": ["Padmanabhpur", "Mohan Nagar", "Pulgaon"]}
                ]
            },
            {
                "district": "Bilaspur",
                "districtCode": "CG-BL",
                "cities": [
                    {"city": "Bilaspur", "cityCode": "CG-BL-01", "mlCovered": False, "baseRateSqFt": 3600, "localities": ["Vyapar Vihar", "Sarkanda", "Rajkishore Nagar", "Tifra"]}
                ]
            }
        ]
    },
    {
        "state": "Goa",
        "stateCode": "GA",
        "type": "State",
        "districts": [
            {
                "district": "North Goa",
                "districtCode": "GA-NG",
                "cities": [
                    {"city": "Panaji", "cityCode": "GA-NG-01", "mlCovered": True, "baseRateSqFt": 9200, "localities": ["Miramar", "Dona Paula", "Altinho", "Caranzalem", "Campal", "Porvorim"]},
                    {"city": "Mapusa", "cityCode": "GA-NG-02", "mlCovered": True, "baseRateSqFt": 7600, "localities": ["Khorlim", "Duler", "Karaswada", "Assagao"]}
                ]
            },
            {
                "district": "South Goa",
                "districtCode": "GA-SG",
                "cities": [
                    {"city": "Margao", "cityCode": "GA-SG-01", "mlCovered": True, "baseRateSqFt": 7400, "localities": ["Fatorda", "Borda", "Aquem", "Navelim", "Colva Road"]},
                    {"city": "Vasco da Gama", "cityCode": "GA-SG-02", "mlCovered": False, "baseRateSqFt": 6900, "localities": ["Dabolim", "Chicalim", "Baina", "Mangor Hill"]}
                ]
            }
        ]
    },
    {
        "state": "Gujarat",
        "stateCode": "GJ",
        "type": "State",
        "districts": [
            {
                "district": "Ahmedabad",
                "districtCode": "GJ-AMD",
                "cities": [
                    {"city": "Ahmedabad", "cityCode": "GJ-AMD-01", "mlCovered": True, "baseRateSqFt": 6400, "localities": ["Satellite", "Prahlad Nagar", "Bopal", "SG Highway", "Gota", "Thaltej", "Vastrapur", "Chandkheda", "Maninagar", "Navrangpura"]},
                    {"city": "Sanand", "cityCode": "GJ-AMD-02", "mlCovered": False, "baseRateSqFt": 4100, "localities": ["GIDC Road", "Chekhla", "Shela Extension"]}
                ]
            },
            {
                "district": "Surat",
                "districtCode": "GJ-SRT",
                "cities": [
                    {"city": "Surat", "cityCode": "GJ-SRT-01", "mlCovered": True, "baseRateSqFt": 5700, "localities": ["Vesu", "Adajan", "Pal", "Piplod", "Althan", "Varachha", "City Light", "Katargam"]},
                    {"city": "Bardoli", "cityCode": "GJ-SRT-02", "mlCovered": False, "baseRateSqFt": 3600, "localities": ["Station Road", "Baben"]}
                ]
            },
            {
                "district": "Vadodara",
                "districtCode": "GJ-VDD",
                "cities": [
                    {"city": "Vadodara", "cityCode": "GJ-VDD-01", "mlCovered": True, "baseRateSqFt": 4800, "localities": ["Alkapuri", "Gotri", "Vasna Bhayli Road", "Manjalpur", "Karelibaug", "Waghodia Road", "Sama"]}
                ]
            },
            {
                "district": "Rajkot",
                "districtCode": "GJ-RJT",
                "cities": [
                    {"city": "Rajkot", "cityCode": "GJ-RJT-01", "mlCovered": True, "baseRateSqFt": 4600, "localities": ["Kalawad Road", "150 Feet Ring Road", "Raiya Road", "Mavdi", "University Road"]}
                ]
            },
            {
                "district": "Gandhinagar",
                "districtCode": "GJ-GNR",
                "cities": [
                    {"city": "Gandhinagar", "cityCode": "GJ-GNR-01", "mlCovered": True, "baseRateSqFt": 5900, "localities": ["GIFT City", "Sargasan", "Kudasan", "Raysan", "Infocity", "Adalaj"]}
                ]
            }
        ]
    },
    {
        "state": "Haryana",
        "stateCode": "HR",
        "type": "State",
        "districts": [
            {
                "district": "Gurugram",
                "districtCode": "HR-GGN",
                "cities": [
                    {"city": "Gurugram", "cityCode": "HR-GGN-01", "mlCovered": True, "baseRateSqFt": 11200, "localities": ["DLF Phase 3", "Golf Course Road", "Sohna Road", "Sector 56", "Sector 82", "Dwarka Expressway", "Palam Vihar", "Sushant Lok 1"]},
                    {"city": "Sohna", "cityCode": "HR-GGN-02", "mlCovered": True, "baseRateSqFt": 6400, "localities": ["Sector 33 Sohna", "Sector 35 Sohna", "Damdama Road"]}
                ]
            },
            {
                "district": "Faridabad",
                "districtCode": "HR-FBD",
                "cities": [
                    {"city": "Faridabad", "cityCode": "HR-FBD-01", "mlCovered": True, "baseRateSqFt": 6800, "localities": ["Sector 15", "Neharpar", "Sector 88", "NIT Faridabad", "Surajkund", "Sector 21C"]}
                ]
            },
            {
                "district": "Panchkula",
                "districtCode": "HR-PKL",
                "cities": [
                    {"city": "Panchkula", "cityCode": "HR-PKL-01", "mlCovered": True, "baseRateSqFt": 7500, "localities": ["Sector 20", "Sector 12A", "MDC Sector 4", "Pinjore", "Sector 25"]}
                ]
            },
            {
                "district": "Karnal",
                "districtCode": "HR-KNL",
                "cities": [
                    {"city": "Karnal", "cityCode": "HR-KNL-01", "mlCovered": False, "baseRateSqFt": 4400, "localities": ["Sector 13", "Model Town", "Sector 32", "Kunjpura Road"]}
                ]
            },
            {
                "district": "Panipat",
                "districtCode": "HR-PNP",
                "cities": [
                    {"city": "Panipat", "cityCode": "HR-PNP-01", "mlCovered": False, "baseRateSqFt": 4300, "localities": ["Model Town", "Sector 18", "Ansal Sushant City", "GT Road"]}
                ]
            }
        ]
    },
    {
        "state": "Himachal Pradesh",
        "stateCode": "HP",
        "type": "State",
        "districts": [
            {
                "district": "Shimla",
                "districtCode": "HP-SML",
                "cities": [
                    {"city": "Shimla", "cityCode": "HP-SML-01", "mlCovered": True, "baseRateSqFt": 6500, "localities": ["New Shimla", "Sanjauli", "Khalini", "Panthaghati", "Chotta Shimla", "Kasumpti"]}
                ]
            },
            {
                "district": "Solan",
                "districtCode": "HP-SLN",
                "cities": [
                    {"city": "Solan", "cityCode": "HP-SLN-01", "mlCovered": False, "baseRateSqFt": 4900, "localities": ["Mall Road", "Chambaghat", "Saproon", "Rajgarh Road"]},
                    {"city": "Baddi", "cityCode": "HP-SLN-02", "mlCovered": False, "baseRateSqFt": 4200, "localities": ["Sai Road", "Phase 3 Housing Board", "Bharmour"]}
                ]
            },
            {
                "district": "Kangra",
                "districtCode": "HP-KGR",
                "cities": [
                    {"city": "Dharamshala", "cityCode": "HP-KGR-01", "mlCovered": False, "baseRateSqFt": 5300, "localities": ["Shyam Nagar", "Sidhpur", "Kotwali Bazaar", "Dari"]}
                ]
            }
        ]
    },
    {
        "state": "Jharkhand",
        "stateCode": "JH",
        "type": "State",
        "districts": [
            {
                "district": "Ranchi",
                "districtCode": "JH-RNC",
                "cities": [
                    {"city": "Ranchi", "cityCode": "JH-RNC-01", "mlCovered": True, "baseRateSqFt": 5100, "localities": ["Morabadi", "Lalpur", "Kanke Road", "Bariatu", "Harmu", "Doranda", "Ashok Nagar", "Namkum"]}
                ]
            },
            {
                "district": "East Singhbhum",
                "districtCode": "JH-ESB",
                "cities": [
                    {"city": "Jamshedpur", "cityCode": "JH-ESB-01", "mlCovered": True, "baseRateSqFt": 4800, "localities": ["Bistupur", "Sakchi", "Mango", "Sonari", "Kadma", "Telco Colony", "Adityapur"]}
                ]
            },
            {
                "district": "Dhanbad",
                "districtCode": "JH-DHN",
                "cities": [
                    {"city": "Dhanbad", "cityCode": "JH-DHN-01", "mlCovered": False, "baseRateSqFt": 3900, "localities": ["Saraidhela", "Hirapur", "Bank More", "Bartand", "Govindpur"]}
                ]
            },
            {
                "district": "Bokaro",
                "districtCode": "JH-BKR",
                "cities": [
                    {"city": "Bokaro Steel City", "cityCode": "JH-BKR-01", "mlCovered": False, "baseRateSqFt": 3800, "localities": ["Chas", "Sector 4", "Co-operative Colony", "Chira Chas"]}
                ]
            }
        ]
    },
    {
        "state": "Karnataka",
        "stateCode": "KA",
        "type": "State",
        "districts": [
            {
                "district": "Bengaluru Urban",
                "districtCode": "KA-BLR",
                "cities": [
                    {"city": "Bengaluru", "cityCode": "KA-BLR-01", "mlCovered": True, "baseRateSqFt": 9800, "localities": ["Whitefield", "Koramangala", "Indiranagar", "Electronic City", "Sarjapur Road", "HSR Layout", "Hebbal", "Yelahanka", "JP Nagar", "Marathahalli", "Bannerghatta Road", "BTM Layout"]}
                ]
            },
            {
                "district": "Mysuru",
                "districtCode": "KA-MYS",
                "cities": [
                    {"city": "Mysuru", "cityCode": "KA-MYS-01", "mlCovered": True, "baseRateSqFt": 5500, "localities": ["Vijayanagar", "Kuvempunagar", "Saraswathipuram", "Gokulam", "Hebbal Mysuru", "Bogadi", "JP Nagar Mysuru"]}
                ]
            },
            {
                "district": "Dakshina Kannada",
                "districtCode": "KA-DK",
                "cities": [
                    {"city": "Mangaluru", "cityCode": "KA-DK-01", "mlCovered": True, "baseRateSqFt": 5900, "localities": ["Kadri", "Bejai", "Kankanady", "Derebail", "Surathkal", "Attavar"]}
                ]
            },
            {
                "district": "Dharwad",
                "districtCode": "KA-DHW",
                "cities": [
                    {"city": "Hubballi", "cityCode": "KA-DHW-01", "mlCovered": False, "baseRateSqFt": 4400, "localities": ["Vidyanagar", "Keshwapur", "Gokul Road", "Navanagar"]},
                    {"city": "Dharwad", "cityCode": "KA-DHW-02", "mlCovered": False, "baseRateSqFt": 4100, "localities": ["Saptapur", "Kalyan Nagar", "Malmaddi"]}
                ]
            },
            {
                "district": "Belagavi",
                "districtCode": "KA-BGV",
                "cities": [
                    {"city": "Belagavi", "cityCode": "KA-BGV-01", "mlCovered": False, "baseRateSqFt": 4300, "localities": ["Tilakwadi", "Hindwadi", "Sadashiv Nagar", "Bhagya Nagar"]}
                ]
            }
        ]
    },
    {
        "state": "Kerala",
        "stateCode": "KL",
        "type": "State",
        "districts": [
            {
                "district": "Ernakulam",
                "districtCode": "KL-EKM",
                "cities": [
                    {"city": "Kochi", "cityCode": "KL-EKM-01", "mlCovered": True, "baseRateSqFt": 7200, "localities": ["Kakkanad", "Edappally", "Panampilly Nagar", "Marine Drive", "Vyttila", "Palarivattom", "Aluva", "Kaloor", "Thrippunithura"]}
                ]
            },
            {
                "district": "Thiruvananthapuram",
                "districtCode": "KL-TVM",
                "cities": [
                    {"city": "Thiruvananthapuram", "cityCode": "KL-TVM-01", "mlCovered": True, "baseRateSqFt": 6300, "localities": ["Kazhakkoottam", "Kowdiar", "Pattom", "Vazhuthacaud", "Sreekaryam", "Vellayambalam", "Peroorkada"]}
                ]
            },
            {
                "district": "Kozhikode",
                "districtCode": "KL-KZK",
                "cities": [
                    {"city": "Kozhikode", "cityCode": "KL-KZK-01", "mlCovered": True, "baseRateSqFt": 5800, "localities": ["Thondayad", "Chevayur", "Nadakkavu", "Mavoor Road", "Pantheerankavu"]}
                ]
            },
            {
                "district": "Thrissur",
                "districtCode": "KL-TSR",
                "cities": [
                    {"city": "Thrissur", "cityCode": "KL-TSR-01", "mlCovered": False, "baseRateSqFt": 5200, "localities": ["Punkunnam", "Ayyanthole", "Kuriachira", "Viyyur", "Ollur"]}
                ]
            }
        ]
    },
    {
        "state": "Madhya Pradesh",
        "stateCode": "MP",
        "type": "State",
        "districts": [
            {
                "district": "Indore",
                "districtCode": "MP-IND",
                "cities": [
                    {"city": "Indore", "cityCode": "MP-IND-01", "mlCovered": True, "baseRateSqFt": 5600, "localities": ["Vijay Nagar", "Super Corridor", "AB Road", "Nipania", "Rau", "Bhawarkua", "Palasia", "Mhow Naka", "Bicholi Mardana"]}
                ]
            },
            {
                "district": "Bhopal",
                "districtCode": "MP-BPL",
                "cities": [
                    {"city": "Bhopal", "cityCode": "MP-BPL-01", "mlCovered": True, "baseRateSqFt": 4700, "localities": ["Arera Colony", "Kolar Road", "Hoshangabad Road", "MP Nagar", "Bawadia Kalan", "Ayodhya Bypass", "Chuna Bhatti"]}
                ]
            },
            {
                "district": "Gwalior",
                "districtCode": "MP-GWL",
                "cities": [
                    {"city": "Gwalior", "cityCode": "MP-GWL-01", "mlCovered": False, "baseRateSqFt": 4100, "localities": ["City Centre", "Lashkar", "Morar", "Thatipur", "Gole Ka Mandir"]}
                ]
            },
            {
                "district": "Jabalpur",
                "districtCode": "MP-JBP",
                "cities": [
                    {"city": "Jabalpur", "cityCode": "MP-JBP-01", "mlCovered": False, "baseRateSqFt": 4000, "localities": ["Vijay Nagar Jabalpur", "Napier Town", "Wright Town", "Madan Mahal", "Adhartal"]}
                ]
            }
        ]
    },
    {
        "state": "Maharashtra",
        "stateCode": "MH",
        "type": "State",
        "districts": [
            {
                "district": "Mumbai City",
                "districtCode": "MH-MUM",
                "cities": [
                    {"city": "Mumbai", "cityCode": "MH-MUM-01", "mlCovered": True, "baseRateSqFt": 21500, "localities": ["Worli", "Lower Parel", "Dadar", "Prabhadevi", "Matunga", "Sion", "Wadala", "Mahim", "Byculla"]}
                ]
            },
            {
                "district": "Mumbai Suburban",
                "districtCode": "MH-MSB",
                "cities": [
                    {"city": "Mumbai Suburban", "cityCode": "MH-MSB-01", "mlCovered": True, "baseRateSqFt": 18200, "localities": ["Andheri West", "Andheri East", "Bandra West", "Powai", "Goregaon East", "Malad West", "Kandivali", "Borivali West", "Chembur", "Ghatkopar", "Mulund"]}
                ]
            },
            {
                "district": "Thane",
                "districtCode": "MH-THN",
                "cities": [
                    {"city": "Navi Mumbai", "cityCode": "MH-THN-01", "mlCovered": True, "baseRateSqFt": 10800, "localities": ["Vashi", "Kharghar", "Nerul", "Belapur", "Airoli", "Ghansoli", "Kopar Khairane", "Seawoods", "Sanpada", "Panvel", "Ulwe", "Kamothe"]},
                    {"city": "Thane", "cityCode": "MH-THN-02", "mlCovered": True, "baseRateSqFt": 12400, "localities": ["Ghodbunder Road", "Majiwada", "Pokhran Road 2", "Kolshet Road", "Balkum", "Hiranandani Estate", "Thane West", "Kalwa"]},
                    {"city": "Kalyan-Dombivli", "cityCode": "MH-THN-03", "mlCovered": True, "baseRateSqFt": 7200, "localities": ["Kalyan West", "Dombivli East", "Khadakpada", "Palava City", "Thakurli"]}
                ]
            },
            {
                "district": "Pune",
                "districtCode": "MH-PUN",
                "cities": [
                    {"city": "Pune", "cityCode": "MH-PUN-01", "mlCovered": True, "baseRateSqFt": 9100, "localities": ["Hinjewadi", "Kharadi", "Baner", "Wakad", "Viman Nagar", "Kothrud", "Hadapsar", "Magarpatta", "Aundh", "Bavdhan", "Wagholi", "Koregaon Park"]},
                    {"city": "Pimpri-Chinchwad", "cityCode": "MH-PUN-02", "mlCovered": True, "baseRateSqFt": 7800, "localities": ["Pimple Saudagar", "Ravet", "Moshi", "Akurdi", "Nigdi", "Punawale", "Tathawade"]}
                ]
            },
            {
                "district": "Nagpur",
                "districtCode": "MH-NGP",
                "cities": [
                    {"city": "Nagpur", "cityCode": "MH-NGP-01", "mlCovered": True, "baseRateSqFt": 5500, "localities": ["MIHAN", "Wardha Road", "Dharampeth", "Manish Nagar", "Sadar", "Besa", "Civil Lines", "Trimurti Nagar"]}
                ]
            },
            {
                "district": "Nashik",
                "districtCode": "MH-NSK",
                "cities": [
                    {"city": "Nashik", "cityCode": "MH-NSK-01", "mlCovered": True, "baseRateSqFt": 5200, "localities": ["Indira Nagar", "Gangapur Road", "College Road", "Pathardi Phata", "Panchavati", "Govind Nagar"]}
                ]
            },
            {
                "district": "Chhatrapati Sambhajinagar",
                "districtCode": "MH-CSN",
                "cities": [
                    {"city": "Chhatrapati Sambhajinagar", "cityCode": "MH-CSN-01", "mlCovered": False, "baseRateSqFt": 4600, "localities": ["CIDCO", "Garkheda", "Nirala Bazar", "Waluj", "Beed Bypass"]}
                ]
            }
        ]
    },
    {
        "state": "Manipur",
        "stateCode": "MN",
        "type": "State",
        "districts": [
            {
                "district": "Imphal West",
                "districtCode": "MN-IW",
                "cities": [
                    {"city": "Imphal", "cityCode": "MN-IW-01", "mlCovered": False, "baseRateSqFt": 3900, "localities": ["Lamphelpat", "Thangmeiband", "Singjamei", "Sagolband", "Uripok"]}
                ]
            },
            {
                "district": "Thoubal",
                "districtCode": "MN-TH",
                "cities": [
                    {"city": "Thoubal", "cityCode": "MN-TH-01", "mlCovered": False, "baseRateSqFt": 3100, "localities": ["Thoubal Bazar", "Athokpam", "Wangjing"]}
                ]
            }
        ]
    },
    {
        "state": "Meghalaya",
        "stateCode": "ML",
        "type": "State",
        "districts": [
            {
                "district": "East Khasi Hills",
                "districtCode": "ML-EKH",
                "cities": [
                    {"city": "Shillong", "cityCode": "ML-EKH-01", "mlCovered": False, "baseRateSqFt": 5100, "localities": ["Laitumkhrah", "Police Bazar", "Laban", "Mawlai", "Nongthymmai", "Polo"]}
                ]
            },
            {
                "district": "West Garo Hills",
                "districtCode": "ML-WGH",
                "cities": [
                    {"city": "Tura", "cityCode": "ML-WGH-01", "mlCovered": False, "baseRateSqFt": 3500, "localities": ["Rongkhon", "Hawakhana", "Chandmari Tura"]}
                ]
            }
        ]
    },
    {
        "state": "Mizoram",
        "stateCode": "MZ",
        "type": "State",
        "districts": [
            {
                "district": "Aizawl",
                "districtCode": "MZ-AZL",
                "cities": [
                    {"city": "Aizawl", "cityCode": "MZ-AZL-01", "mlCovered": False, "baseRateSqFt": 4400, "localities": ["Zarkawt", "Dawrpui", "Chanmari", "Bawngkawn", "Chaltlang"]}
                ]
            },
            {
                "district": "Lunglei",
                "districtCode": "MZ-LGL",
                "cities": [
                    {"city": "Lunglei", "cityCode": "MZ-LGL-01", "mlCovered": False, "baseRateSqFt": 3400, "localities": ["Chanmari Lunglei", "Venglai", "Zotlang"]}
                ]
            }
        ]
    },
    {
        "state": "Nagaland",
        "stateCode": "NL",
        "type": "State",
        "districts": [
            {
                "district": "Dimapur",
                "districtCode": "NL-DMP",
                "cities": [
                    {"city": "Dimapur", "cityCode": "NL-DMP-01", "mlCovered": False, "baseRateSqFt": 4100, "localities": ["Purana Bazar", "Duncan Basti", "Circular Road", "Chumoukedima", "Kuda Village"]}
                ]
            },
            {
                "district": "Kohima",
                "districtCode": "NL-KHM",
                "cities": [
                    {"city": "Kohima", "cityCode": "NL-KHM-01", "mlCovered": False, "baseRateSqFt": 4300, "localities": ["PR Hill", "High School Colony", "Chandmari Kohima", "Lerie Colony"]}
                ]
            }
        ]
    },
    {
        "state": "Odisha",
        "stateCode": "OD",
        "type": "State",
        "districts": [
            {
                "district": "Khordha",
                "districtCode": "OD-KHD",
                "cities": [
                    {"city": "Bhubaneswar", "cityCode": "OD-KHD-01", "mlCovered": True, "baseRateSqFt": 6100, "localities": ["Patia", "Chandrasekharpur", "Khandagiri", "Saheed Nagar", "Jayadev Vihar", "Rasulgarh", "Nayapalli", "Tamando", "Sundarpada"]}
                ]
            },
            {
                "district": "Cuttack",
                "districtCode": "OD-CTC",
                "cities": [
                    {"city": "Cuttack", "cityCode": "OD-CTC-01", "mlCovered": True, "baseRateSqFt": 5100, "localities": ["CDA Sector 9", "CDA Sector 6", "Badambadi", "Link Road", "Jagatpur", "Chauliaganj"]}
                ]
            },
            {
                "district": "Sundargarh",
                "districtCode": "OD-SNG",
                "cities": [
                    {"city": "Rourkela", "cityCode": "OD-SNG-01", "mlCovered": False, "baseRateSqFt": 3900, "localities": ["Civil Township", "Chhend Colony", "Koel Nagar", "Udit Nagar"]}
                ]
            },
            {
                "district": "Puri",
                "districtCode": "OD-PRI",
                "cities": [
                    {"city": "Puri", "cityCode": "OD-PRI-01", "mlCovered": False, "baseRateSqFt": 4800, "localities": ["Chakratirtha Road", "Swargadwar", "Grand Road", "Baliapanda"]}
                ]
            }
        ]
    },
    {
        "state": "Punjab",
        "stateCode": "PB",
        "type": "State",
        "districts": [
            {
                "district": "SAS Nagar (Mohali)",
                "districtCode": "PB-MOH",
                "cities": [
                    {"city": "Mohali", "cityCode": "PB-MOH-01", "mlCovered": True, "baseRateSqFt": 7300, "localities": ["Sector 70", "Aerocity", "Kharar Road", "Sector 82", "Phase 7", "Sector 115", "IT City"]},
                    {"city": "Zirakpur", "cityCode": "PB-MOH-02", "mlCovered": True, "baseRateSqFt": 5900, "localities": ["VIP Road", "PR7 Airport Road", "Dhakoli", "Baltana", "Patiala Road"]}
                ]
            },
            {
                "district": "Ludhiana",
                "districtCode": "PB-LDH",
                "cities": [
                    {"city": "Ludhiana", "cityCode": "PB-LDH-01", "mlCovered": True, "baseRateSqFt": 5400, "localities": ["Sarabha Nagar", "Model Town", "Ferozepur Road", "BRS Nagar", "Civil Lines", "Pakhowal Road", "Dugri"]}
                ]
            },
            {
                "district": "Amritsar",
                "districtCode": "PB-ASR",
                "cities": [
                    {"city": "Amritsar", "cityCode": "PB-ASR-01", "mlCovered": True, "baseRateSqFt": 5100, "localities": ["Ranjit Avenue", "Lawrence Road", "GT Road", "Majitha Road", "Green Avenue"]}
                ]
            },
            {
                "district": "Jalandhar",
                "districtCode": "PB-JLD",
                "cities": [
                    {"city": "Jalandhar", "cityCode": "PB-JLD-01", "mlCovered": False, "baseRateSqFt": 4700, "localities": ["Model Town Jalandhar", "Urban Estate", "Rama Mandi", "PPR Mall Road"]}
                ]
            }
        ]
    },
    {
        "state": "Rajasthan",
        "stateCode": "RJ",
        "type": "State",
        "districts": [
            {
                "district": "Jaipur",
                "districtCode": "RJ-JPR",
                "cities": [
                    {"city": "Jaipur", "cityCode": "RJ-JPR-01", "mlCovered": True, "baseRateSqFt": 5800, "localities": ["Vaishali Nagar", "Mansarovar", "Malviya Nagar", "Jagatpura", "Tonk Road", "Ajmer Road", "C-Scheme", "Jhotwara", "Pratap Nagar", "Bani Park"]}
                ]
            },
            {
                "district": "Udaipur",
                "districtCode": "RJ-UDP",
                "cities": [
                    {"city": "Udaipur", "cityCode": "RJ-UDP-01", "mlCovered": True, "baseRateSqFt": 5300, "localities": ["Hiran Magri", "Fatehpura", "Shobhagpura", "Bhuwana", "Sukher"]}
                ]
            },
            {
                "district": "Jodhpur",
                "districtCode": "RJ-JDH",
                "cities": [
                    {"city": "Jodhpur", "cityCode": "RJ-JDH-01", "mlCovered": True, "baseRateSqFt": 4800, "localities": ["Sardarpura", "Ratanada", "Pal Road", "Shastri Nagar", "Chopasni Housing Board"]}
                ]
            },
            {
                "district": "Kota",
                "districtCode": "RJ-KOT",
                "cities": [
                    {"city": "Kota", "cityCode": "RJ-KOT-01", "mlCovered": False, "baseRateSqFt": 4400, "localities": ["Talwandi", "Mahaveer Nagar", "Rajeev Gandhi Nagar", "Kunhari", "Vigyan Nagar"]}
                ]
            }
        ]
    },
    {
        "state": "Sikkim",
        "stateCode": "SK",
        "type": "State",
        "districts": [
            {
                "district": "Gangtok",
                "districtCode": "SK-GTK",
                "cities": [
                    {"city": "Gangtok", "cityCode": "SK-GTK-01", "mlCovered": False, "baseRateSqFt": 5600, "localities": ["MG Marg", "Tadong", "Deorali", "Ranipool", "Development Area"]}
                ]
            },
            {
                "district": "Namchi",
                "districtCode": "SK-NMC",
                "cities": [
                    {"city": "Namchi", "cityCode": "SK-NMC-01", "mlCovered": False, "baseRateSqFt": 4100, "localities": ["Central Park", "Dambudara", "Boomtar"]}
                ]
            }
        ]
    },
    {
        "state": "Tamil Nadu",
        "stateCode": "TN",
        "type": "State",
        "districts": [
            {
                "district": "Chennai",
                "districtCode": "TN-CHN",
                "cities": [
                    {"city": "Chennai", "cityCode": "TN-CHN-01", "mlCovered": True, "baseRateSqFt": 8900, "localities": ["OMR (IT Expressway)", "Anna Nagar", "Velachery", "Adyar", "T. Nagar", "Porur", "Tambaram", "Sholinganallur", "Guindy", "Medavakkam", "Nungambakkam", "Perambur"]}
                ]
            },
            {
                "district": "Coimbatore",
                "districtCode": "TN-CBE",
                "cities": [
                    {"city": "Coimbatore", "cityCode": "TN-CBE-01", "mlCovered": True, "baseRateSqFt": 5700, "localities": ["Saravanampatti", "RS Puram", "Peelamedu", "Race Course", "Saibaba Colony", "Vadavalli", "Singanallur", "Kovaipudur"]}
                ]
            },
            {
                "district": "Madurai",
                "districtCode": "TN-MDU",
                "cities": [
                    {"city": "Madurai", "cityCode": "TN-MDU-01", "mlCovered": True, "baseRateSqFt": 4900, "localities": ["Anna Nagar Madurai", "KK Nagar", "Bypass Road", "Thiruparankundram", "Iyer Bungalow"]}
                ]
            },
            {
                "district": "Tiruchirappalli",
                "districtCode": "TN-TCY",
                "cities": [
                    {"city": "Tiruchirappalli", "cityCode": "TN-TCY-01", "mlCovered": False, "baseRateSqFt": 4600, "localities": ["Thillai Nagar", "Srirangam", "KK Nagar Trichy", "Cantonment", "Woraiyur"]}
                ]
            },
            {
                "district": "Salem",
                "districtCode": "TN-SLM",
                "cities": [
                    {"city": "Salem", "cityCode": "TN-SLM-01", "mlCovered": False, "baseRateSqFt": 4400, "localities": ["Fairlands", "Alagapuram", "Hasthampatti", "Suramangalam"]}
                ]
            }
        ]
    },
    {
        "state": "Telangana",
        "stateCode": "TG",
        "type": "State",
        "districts": [
            {
                "district": "Hyderabad",
                "districtCode": "TG-HYD",
                "cities": [
                    {"city": "Hyderabad", "cityCode": "TG-HYD-01", "mlCovered": True, "baseRateSqFt": 8600, "localities": ["Gachibowli", "HITEC City", "Kondapur", "Madhapur", "Banjara Hills", "Jubilee Hills", "Kukatpally", "Miyapur", "Manikonda", "Kokapet", "Nallagandla", "Begumpet", "LB Nagar"]}
                ]
            },
            {
                "district": "Medchal-Malkajgiri",
                "districtCode": "TG-MDM",
                "cities": [
                    {"city": "Secunderabad", "cityCode": "TG-MDM-01", "mlCovered": True, "baseRateSqFt": 6900, "localities": ["Sainikpuri", "Alwal", "Kompally", "Malkajgiri", "Yapral", "Bowenpally", "Tarnaka"]}
                ]
            },
            {
                "district": "Hanumakonda",
                "districtCode": "TG-HNK",
                "cities": [
                    {"city": "Warangal", "cityCode": "TG-HNK-01", "mlCovered": False, "baseRateSqFt": 4300, "localities": ["Hanamkonda", "Kazipet", "Subedari", "Nakkalagutta"]}
                ]
            },
            {
                "district": "Nizamabad",
                "districtCode": "TG-NZB",
                "cities": [
                    {"city": "Nizamabad", "cityCode": "TG-NZB-01", "mlCovered": False, "baseRateSqFt": 3700, "localities": ["Vinayak Nagar", "Khaleelwadi", "Subhash Nagar"]}
                ]
            }
        ]
    },
    {
        "state": "Tripura",
        "stateCode": "TR",
        "type": "State",
        "districts": [
            {
                "district": "West Tripura",
                "districtCode": "TR-WT",
                "cities": [
                    {"city": "Agartala", "cityCode": "TR-WT-01", "mlCovered": False, "baseRateSqFt": 4000, "localities": ["Krishnanagar", "Ramnagar", "Banamalipur", "Indranagar", "Kunjaban"]}
                ]
            },
            {
                "district": "Gomati",
                "districtCode": "TR-GM",
                "cities": [
                    {"city": "Udaipur Tripura", "cityCode": "TR-GM-01", "mlCovered": False, "baseRateSqFt": 3100, "localities": ["Matabari", "Rajarbag", "Chanban"]}
                ]
            }
        ]
    },
    {
        "state": "Uttar Pradesh",
        "stateCode": "UP",
        "type": "State",
        "districts": [
            {
                "district": "Gautam Buddha Nagar",
                "districtCode": "UP-GBN",
                "cities": [
                    {"city": "Noida", "cityCode": "UP-GBN-01", "mlCovered": True, "baseRateSqFt": 9400, "localities": ["Sector 62", "Sector 150", "Sector 137", "Sector 75", "Sector 18", "Noida Expressway", "Sector 78", "Sector 104"]},
                    {"city": "Greater Noida", "cityCode": "UP-GBN-02", "mlCovered": True, "baseRateSqFt": 6900, "localities": ["Noida Extension (Greater Noida West)", "Pari Chowk", "Alpha 1", "Knowledge Park 3", "Chi 4", "Omega 1"]}
                ]
            },
            {
                "district": "Ghaziabad",
                "districtCode": "UP-GZB",
                "cities": [
                    {"city": "Ghaziabad", "cityCode": "UP-GZB-01", "mlCovered": True, "baseRateSqFt": 6500, "localities": ["Indirapuram", "Vaishali", "Raj Nagar Extension", "Crossings Republik", "Vasundhara", "Kaushambi", "Kavi Nagar"]}
                ]
            },
            {
                "district": "Lucknow",
                "districtCode": "UP-LKO",
                "cities": [
                    {"city": "Lucknow", "cityCode": "UP-LKO-01", "mlCovered": True, "baseRateSqFt": 5800, "localities": ["Gomti Nagar", "Gomti Nagar Extension", "Hazratganj", "Aliganj", "Indira Nagar Lucknow", "Shaheed Path", "Mahanagar", "Jankipuram"]}
                ]
            },
            {
                "district": "Varanasi",
                "districtCode": "UP-VNS",
                "cities": [
                    {"city": "Varanasi", "cityCode": "UP-VNS-01", "mlCovered": True, "baseRateSqFt": 5500, "localities": ["Sigra", "Lanka", "Mahmoorganj", "Sarnath", "Bhelupur", "Cantt", "Shivpur"]}
                ]
            },
            {
                "district": "Kanpur Nagar",
                "districtCode": "UP-KNP",
                "cities": [
                    {"city": "Kanpur", "cityCode": "UP-KNP-01", "mlCovered": True, "baseRateSqFt": 4900, "localities": ["Swaroop Nagar", "Kakadeo", "Kalyanpur", "Civil Lines Kanpur", "Kidwai Nagar", "Tilak Nagar"]}
                ]
            },
            {
                "district": "Agra",
                "districtCode": "UP-AGR",
                "cities": [
                    {"city": "Agra", "cityCode": "UP-AGR-01", "mlCovered": False, "baseRateSqFt": 4500, "localities": ["Sikandra", "Dayal Bagh", "Tajganj", "Kamla Nagar", "Fatehabad Road"]}
                ]
            },
            {
                "district": "Prayagraj",
                "districtCode": "UP-PRY",
                "cities": [
                    {"city": "Prayagraj", "cityCode": "UP-PRY-01", "mlCovered": False, "baseRateSqFt": 4800, "localities": ["Civil Lines Prayagraj", "Jhalwa", "Naini", "Tagore Town", "Georgetown"]}
                ]
            }
        ]
    },
    {
        "state": "Uttarakhand",
        "stateCode": "UK",
        "type": "State",
        "districts": [
            {
                "district": "Dehradun",
                "districtCode": "UK-DDN",
                "cities": [
                    {"city": "Dehradun", "cityCode": "UK-DDN-01", "mlCovered": True, "baseRateSqFt": 6200, "localities": ["Rajpur Road", "Sahastradhara Road", "GMS Road", "Vasant Vihar", "Clement Town", "Dalanwala", "Prem Nagar"]},
                    {"city": "Rishikesh", "cityCode": "UK-DDN-02", "mlCovered": False, "baseRateSqFt": 5700, "localities": ["Tapovan", "AIIMS Road Rishikesh", "Aam Bag"]}
                ]
            },
            {
                "district": "Haridwar",
                "districtCode": "UK-HRD",
                "cities": [
                    {"city": "Haridwar", "cityCode": "UK-HRD-01", "mlCovered": True, "baseRateSqFt": 4800, "localities": ["SIDCUL", "Shivalik Nagar", "Jwalapur", "Kankhal", "Ranipur"]},
                    {"city": "Roorkee", "cityCode": "UK-HRD-02", "mlCovered": False, "baseRateSqFt": 4100, "localities": ["Civil Lines Roorkee", "IIT Roorkee Road", "Ganeshpur"]}
                ]
            },
            {
                "district": "Nainital",
                "districtCode": "UK-NTL",
                "cities": [
                    {"city": "Haldwani", "cityCode": "UK-NTL-01", "mlCovered": False, "baseRateSqFt": 4500, "localities": ["Kathgodam", "Mukhani", "Kusumkhera", "Bhotia Parao"]}
                ]
            }
        ]
    },
    {
        "state": "West Bengal",
        "stateCode": "WB",
        "type": "State",
        "districts": [
            {
                "district": "Kolkata",
                "districtCode": "WB-KOL",
                "cities": [
                    {"city": "Kolkata", "cityCode": "WB-KOL-01", "mlCovered": True, "baseRateSqFt": 7400, "localities": ["Ballygunge", "Alipore", "Tollygunge", "Jadavpur", "Garia", "Behala", "EM Bypass", "Park Street", "Kasba", "Dum Dum"]}
                ]
            },
            {
                "district": "North 24 Parganas",
                "districtCode": "WB-N24",
                "cities": [
                    {"city": "New Town", "cityCode": "WB-N24-01", "mlCovered": True, "baseRateSqFt": 6900, "localities": ["Action Area I", "Action Area II", "Action Area III", "Rajarhat", "Eco Park Zone"]},
                    {"city": "Bidhannagar (Salt Lake)", "cityCode": "WB-N24-02", "mlCovered": True, "baseRateSqFt": 7900, "localities": ["Salt Lake Sector I", "Salt Lake Sector II", "Salt Lake Sector III", "Salt Lake Sector V", "Kestopur"]}
                ]
            },
            {
                "district": "Howrah",
                "districtCode": "WB-HWH",
                "cities": [
                    {"city": "Howrah", "cityCode": "WB-HWH-01", "mlCovered": True, "baseRateSqFt": 5200, "localities": ["Shibpur", "Bally", "Liluah", "Santragachi", "Kona Expressway"]}
                ]
            },
            {
                "district": "Darjeeling",
                "districtCode": "WB-DRJ",
                "cities": [
                    {"city": "Siliguri", "cityCode": "WB-DRJ-01", "mlCovered": False, "baseRateSqFt": 4700, "localities": ["Sevoke Road", "Matigara", "Pradhan Nagar", "Hakimpara"]}
                ]
            },
            {
                "district": "Paschim Bardhaman",
                "districtCode": "WB-PBD",
                "cities": [
                    {"city": "Durgapur", "cityCode": "WB-PBD-01", "mlCovered": False, "baseRateSqFt": 3900, "localities": ["City Centre Durgapur", "Bidhannagar Durgapur", "Benachity", "Muchipara"]}
                ]
            }
        ]
    },

    # ==================== 8 UNION TERRITORIES ====================
    {
        "state": "Andaman and Nicobar Islands",
        "stateCode": "AN",
        "type": "Union Territory",
        "districts": [
            {
                "district": "South Andaman",
                "districtCode": "AN-SA",
                "cities": [
                    {"city": "Sri Vijaya Puram (Port Blair)", "cityCode": "AN-SA-01", "mlCovered": False, "baseRateSqFt": 5400, "localities": ["Aberdeen Bazar", "Haddo", "Garacharma", "Prothrapur", "Dollygunj", "Bathu Basti"]}
                ]
            },
            {
                "district": "North and Middle Andaman",
                "districtCode": "AN-NMA",
                "cities": [
                    {"city": "Mayabunder", "cityCode": "AN-NMA-01", "mlCovered": False, "baseRateSqFt": 3500, "localities": ["Danapur Mayabunder", "Rampur", "Pokadera"]}
                ]
            }
        ]
    },
    {
        "state": "Chandigarh",
        "stateCode": "CH",
        "type": "Union Territory",
        "districts": [
            {
                "district": "Chandigarh",
                "districtCode": "CH-CHD",
                "cities": [
                    {"city": "Chandigarh", "cityCode": "CH-CHD-01", "mlCovered": True, "baseRateSqFt": 10500, "localities": ["Sector 17", "Sector 35", "Sector 22", "Sector 43", "Sector 8", "Sector 9", "Manimajra", "IT Park Chandigarh", "Sector 44"]}
                ]
            }
        ]
    },
    {
        "state": "Dadra and Nagar Haveli and Daman and Diu",
        "stateCode": "DD",
        "type": "Union Territory",
        "districts": [
            {
                "district": "Daman",
                "districtCode": "DD-DMN",
                "cities": [
                    {"city": "Daman", "cityCode": "DD-DMN-01", "mlCovered": False, "baseRateSqFt": 4400, "localities": ["Nani Daman", "Moti Daman", "Devka Road", "Mashal Chowk"]}
                ]
            },
            {
                "district": "Dadra and Nagar Haveli",
                "districtCode": "DD-DNH",
                "cities": [
                    {"city": "Silvassa", "cityCode": "DD-DNH-01", "mlCovered": False, "baseRateSqFt": 4300, "localities": ["Amli", "Samarvarni", "Naroli Road", "Tokarkhada"]}
                ]
            },
            {
                "district": "Diu",
                "districtCode": "DD-DIU",
                "cities": [
                    {"city": "Diu", "cityCode": "DD-DIU-01", "mlCovered": False, "baseRateSqFt": 4200, "localities": ["Ghoghla", "Nagoa Road", "Bunder Chowk"]}
                ]
            }
        ]
    },
    {
        "state": "Delhi",
        "stateCode": "DL",
        "type": "Union Territory",
        "districts": [
            {
                "district": "New Delhi",
                "districtCode": "DL-ND",
                "cities": [
                    {"city": "New Delhi", "cityCode": "DL-ND-01", "mlCovered": True, "baseRateSqFt": 16500, "localities": ["Connaught Place", "Chanakyapuri", "Vasant Vihar", "RK Puram", "Karol Bagh", "Rajendra Place", "Patel Nagar"]}
                ]
            },
            {
                "district": "South Delhi",
                "districtCode": "DL-SD",
                "cities": [
                    {"city": "South Delhi", "cityCode": "DL-SD-01", "mlCovered": True, "baseRateSqFt": 17200, "localities": ["Greater Kailash", "Saket", "Hauz Khas", "Defence Colony", "Lajpat Nagar", "Malviya Nagar Delhi", "Chhatarpur", "Kalkaji", "Green Park"]}
                ]
            },
            {
                "district": "South West Delhi",
                "districtCode": "DL-SWD",
                "cities": [
                    {"city": "Dwarka", "cityCode": "DL-SWD-01", "mlCovered": True, "baseRateSqFt": 11400, "localities": ["Dwarka Sector 6", "Dwarka Sector 10", "Dwarka Sector 12", "Dwarka Sector 19", "Dwarka Sector 23", "Vasant Kunj", "Janakpuri", "Uttam Nagar"]}
                ]
            },
            {
                "district": "North West Delhi",
                "districtCode": "DL-NWD",
                "cities": [
                    {"city": "Rohini", "cityCode": "DL-NWD-01", "mlCovered": True, "baseRateSqFt": 10800, "localities": ["Rohini Sector 7", "Rohini Sector 13", "Rohini Sector 24", "Pitampura", "Shalimar Bagh", "Model Town Delhi", "Ashok Vihar"]}
                ]
            },
            {
                "district": "East Delhi",
                "districtCode": "DL-ED",
                "cities": [
                    {"city": "East Delhi", "cityCode": "DL-ED-01", "mlCovered": True, "baseRateSqFt": 10200, "localities": ["Mayur Vihar Phase 1", "Mayur Vihar Phase 2", "Preet Vihar", "Laxmi Nagar", "Patparganj", "IP Extension", "Shahdara"]}
                ]
            }
        ]
    },
    {
        "state": "Jammu and Kashmir",
        "stateCode": "JK",
        "type": "Union Territory",
        "districts": [
            {
                "district": "Srinagar",
                "districtCode": "JK-SGR",
                "cities": [
                    {"city": "Srinagar", "cityCode": "JK-SGR-01", "mlCovered": False, "baseRateSqFt": 5500, "localities": ["Rajbagh", "Lal Chowk", "Hyderpora", "Bemina", "Jawahar Nagar", "Chanapora"]}
                ]
            },
            {
                "district": "Jammu",
                "districtCode": "JK-JMU",
                "cities": [
                    {"city": "Jammu", "cityCode": "JK-JMU-01", "mlCovered": True, "baseRateSqFt": 5200, "localities": ["Gandhi Nagar Jammu", "Trikuta Nagar", "Channi Himmat", "Sainik Colony", "Talab Tillo", "Janipur"]}
                ]
            }
        ]
    },
    {
        "state": "Ladakh",
        "stateCode": "LA",
        "type": "Union Territory",
        "districts": [
            {
                "district": "Leh",
                "districtCode": "LA-LEH",
                "cities": [
                    {"city": "Leh", "cityCode": "LA-LEH-01", "mlCovered": False, "baseRateSqFt": 4900, "localities": ["Main Market Leh", "Changspa", "Skalzangling", "Choglamsar"]}
                ]
            },
            {
                "district": "Kargil",
                "districtCode": "LA-KRG",
                "cities": [
                    {"city": "Kargil", "cityCode": "LA-KRG-01", "mlCovered": False, "baseRateSqFt": 3900, "localities": ["Main Bazaar Kargil", "Baroo", "Poyen"]}
                ]
            }
        ]
    },
    {
        "state": "Lakshadweep",
        "stateCode": "LD",
        "type": "Union Territory",
        "districts": [
            {
                "district": "Lakshadweep",
                "districtCode": "LD-LKW",
                "cities": [
                    {"city": "Kavaratti", "cityCode": "LD-LKW-01", "mlCovered": False, "baseRateSqFt": 4500, "localities": ["Ujra", "Melacheri", "Kavaratti Jetty Road"]},
                    {"city": "Agatti", "cityCode": "LD-LKW-02", "mlCovered": False, "baseRateSqFt": 4200, "localities": ["Airport Ward", "South Village"]}
                ]
            }
        ]
    },
    {
        "state": "Puducherry",
        "stateCode": "PY",
        "type": "Union Territory",
        "districts": [
            {
                "district": "Puducherry",
                "districtCode": "PY-PDY",
                "cities": [
                    {"city": "Puducherry", "cityCode": "PY-PDY-01", "mlCovered": True, "baseRateSqFt": 5800, "localities": ["White Town", "Lawspet", "Muthialpet", "Mudaliarpet", "Reddiarpalayam", "Rainbow Nagar", "Auroville Road"]}
                ]
            },
            {
                "district": "Karaikal",
                "districtCode": "PY-KRK",
                "cities": [
                    {"city": "Karaikal", "cityCode": "PY-KRK-01", "mlCovered": False, "baseRateSqFt": 3900, "localities": ["Nehru Nagar Karaikal", "Kovilpathu", "Thalatheru"]}
                ]
            }
        ]
    }
]


def generate_master_dataset():
    states_count = sum(1 for s in INDIA_ADMINISTRATIVE_DATA if s["type"] == "State")
    uts_count = sum(1 for s in INDIA_ADMINISTRATIVE_DATA if s["type"] == "Union Territory")
    assert states_count == 28, f"Expected 28 states, got {states_count}"
    assert uts_count == 8, f"Expected 8 UTs, got {uts_count}"

    districts_count = 0
    cities_count = 0
    localities_count = 0
    ml_covered_cities = []
    flat_records = []

    for s in sorted(INDIA_ADMINISTRATIVE_DATA, key=lambda x: x["state"]):
        for d in sorted(s["districts"], key=lambda x: x["district"]):
            districts_count += 1
            for c in sorted(d["cities"], key=lambda x: x["city"]):
                cities_count += 1
                if c["mlCovered"]:
                    ml_covered_cities.append({
                        "state": s["state"],
                        "stateCode": s["stateCode"],
                        "district": d["district"],
                        "city": c["city"],
                        "cityCode": c["cityCode"],
                        "baseRateSqFt": c["baseRateSqFt"],
                        "localities": sorted(c["localities"])
                    })
                for loc in sorted(c["localities"]):
                    localities_count += 1
                    flat_records.append({
                        "country": "India",
                        "state": s["state"],
                        "stateCode": s["stateCode"],
                        "administrativeType": s["type"],
                        "district": d["district"],
                        "districtCode": d["districtCode"],
                        "city": c["city"],
                        "cityCode": c["cityCode"],
                        "locality": loc,
                        "mlCovered": c["mlCovered"],
                        "baseRateSqFt": c["baseRateSqFt"],
                        "isActive": True
                    })

    master_payload = {
        "metadata": {
            "datasetName": "HOUSE AI India Administrative & Urban Property Location Master",
            "source": "Census of India Administrative Directory & Official State/UT Municipal Corporations Reference",
            "version": "1.0.0",
            "importDate": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "country": "India",
            "totalStates": states_count,
            "totalUnionTerritories": uts_count,
            "totalAdministrativeUnits": states_count + uts_count,
            "totalDistricts": districts_count,
            "totalCities": cities_count,
            "totalLocalities": localities_count,
            "mlCoveredCitiesCount": len(ml_covered_cities)
        },
        "statesAndUTs": sorted(INDIA_ADMINISTRATIVE_DATA, key=lambda x: x["state"]),
        "mlCoveredCities": ml_covered_cities,
        "flatLocations": flat_records
    }

    base_dir = os.path.dirname(os.path.abspath(__file__))
    out_path = os.path.join(base_dir, "data", "location_data", "india_locations.json")
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(master_payload, f, indent=2, ensure_ascii=False)

    backend_out = os.path.join(base_dir, "..", "backend", "config", "india_locations.json")
    os.makedirs(os.path.dirname(backend_out), exist_ok=True)
    with open(backend_out, "w", encoding="utf-8") as f:
        json.dump(master_payload, f, indent=2, ensure_ascii=False)

    print(f"Generated India Location Master Dataset:")
    print(f"  States: {states_count} | UTs: {uts_count} | Districts: {districts_count} | Cities: {cities_count} | Localities: {localities_count}")
    print(f"  ML Covered Cities: {len(ml_covered_cities)}")


if __name__ == "__main__":
    generate_master_dataset()

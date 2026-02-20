/**
 * 东盟二手车知识库搜索引擎
 * 专注马来西亚、新加坡、泰国、印尼等东盟市场
 */

// 常量配置
const CONFIG = {
    DEFAULT_TOP_K: 3,
    MAX_RECOMMENDATIONS: 3,
    CONFIDENCE_BASE_SCORE: 20,
    KEYWORD_MATCH_WEIGHT: 10,
    PARTIAL_MATCH_WEIGHT: 5,
    TEXT_MATCH_WEIGHT: 2,
    SYNONYM_MATCH_WEIGHT: 3,
    MATCH_BONUS_WEIGHT: 2
};

// 内嵌知识库数据（东盟二手车市场）
const knowledgeBase = {
  "metadata": {
    "version": "2.0",
    "totalQAPairs": 12,
    "categories": ["price", "condition", "process", "recommendation", "policy", "asean"],
    "lastUpdated": "2024-06-15",
    "region": "ASEAN"
  },
  "qa_pairs": [
    {
      "id": "price_001",
      "category": "price",
      "keywords": ["丰田", "Hilux", "价格", "多少钱", "二手", "皮卡", "Toyota"],
      "questions": [
        "丰田Hilux二手多少钱？",
        "Hilux二手车价格",
        "二手丰田Hilux什么价",
        "Toyota Hilux price second hand"
      ],
      "answer": "丰田Hilux二手车价格区间（东盟市场）：\n• 2018-2019款：8-12万令吉/2.5-4亿印尼盾\n• 2020-2021款：12-16万令吉/4-5.5亿印尼盾\n• 2022-2023款：16-22万令吉/5.5-7.5亿印尼盾\n\n影响因素：\n1. 行驶里程（东盟地区年均2-3万公里）\n2. 是否越野使用历史\n3. 海关进口税费情况\n4. 右舵/左舵版本差异\n\n💡 Hilux在东盟保值率高，三年保值率约70-75%",
      "relatedModels": ["福特 Ranger", "三菱 Triton", "五十铃 D-Max"]
    },
    {
      "id": "price_002",
      "category": "price",
      "keywords": ["本田", "City", "Jazz", "价格", "多少钱", "二手", "Honda"],
      "questions": [
        "本田City二手多少钱？",
        "Honda Jazz二手车价格",
        "二手本田City什么价",
        "Honda City second hand price"
      ],
      "answer": "本田City/Jazz二手车价格区间（东盟市场）：\n• 2018-2019款：5-7万令吉/1.5-2.2亿印尼盾\n• 2020-2021款：7-9万令吉/2.2-2.8亿印尼盾\n• 2022-2023款：9-12万令吉/2.8-3.8亿印尼盾\n\n东盟特色：\n- 泰国制造版本性价比高\n- 马来西亚本地组装价格更优\n- 印尼进口版本税费较高\n\n💡 City是东盟最畅销轿车之一，维修网点遍布",
      "relatedModels": ["丰田 Vios", "马自达 2", "日产 Almera"]
    },
    {
      "id": "price_003",
      "category": "price",
      "keywords": ["三菱", "Xpander", "价格", "多少钱", "二手", "MPV", "Mitsubishi"],
      "questions": [
        "三菱Xpander二手多少钱？",
        "Xpander二手车价格",
        "二手三菱Xpander什么价",
        "Mitsubishi Xpander second hand"
      ],
      "answer": "三菱Xpander二手车价格区间（东盟市场）：\n• 2019-2020款：7-9万令吉/2-2.5亿印尼盾\n• 2021-2022款：9-12万令吉/2.5-3.5亿印尼盾\n• 2023款及以上：12-15万令吉/3.5-4.5亿印尼盾\n\n东盟MPV市场特点：\n- 印尼制造，面向东盟家庭设计\n- 7座布局适合大家庭\n- 通过性好，适应东南亚路况\n\n⚠️ 注意检查空调系统（热带气候使用频繁）",
      "relatedModels": ["丰田 Avanza", "本田 BR-V", "铃木 Ertiga"]
    },
    {
      "id": "asean_001",
      "category": "asean",
      "keywords": ["进口", "关税", "税费", "新加坡", "马来西亚", "泰国", "印尼", "跨境"],
      "questions": [
        "进口二手车到新加坡需要什么手续？",
        "马来西亚二手车进口税费多少？",
        "泰国买车可以开到马来西亚吗？",
        "ASEAN car import tax"
      ],
      "answer": "东盟二手车跨境交易指南：\n\n**新加坡**\n- 车辆进口需有COE（拥车证）\n- 关税：根据OMV计算，约20-300%\n- 建议：直接购买本地二手车更划算\n\n**马来西亚**\n- 进口车需符合JPJ标准\n- 关税：0-30%（东盟内部有优惠）\n- AP准证：个人进口需申请\n\n**泰国**\n- 右舵车可直接进口\n- 左舵车限制进口\n- 税费：约车辆价值的80-200%\n\n**印尼**\n- 进口限制严格，建议购买本地车\n- 税费高昂，含增值税、奢侈品税等\n\n💡 建议：在购车国本地使用，跨境交易成本高",
      "relatedTopics": ["过户", "牌照", "保险"]
    },
    {
      "id": "condition_001",
      "category": "condition",
      "keywords": ["事故车", "水淹车", "判断", "识别", "洪水", "flood"],
      "questions": [
        "怎么判断事故车？",
        "如何识别水淹车？",
        "洪水车有什么特征？",
        "check flood damage car"
      ],
      "answer": "东盟地区判断事故/水淹车的方法：\n\n**水淹车检查（重点，东南亚雨季多发）**\n1. **内饰检查**\n   - 地毯下方是否有泥沙、水渍\n   - 座椅滑轨锈蚀情况\n   - 空调系统霉味\n\n2. **电气系统**\n   - 东南亚潮湿气候下线路易氧化\n   - 检查保险丝盒是否有水痕\n   - 测试所有电子设备\n\n3. **底盘检查**\n   - 底盘防锈涂层是否完好\n   - 排气系统锈蚀程度\n\n**事故车检查**\n- 检查ABC柱修复痕迹\n- 查看4S店保养记录\n- 使用Carfax或本地 equivalent 查询\n\n⚠️ 东盟地区雨季洪水频发，水淹车风险高！",
      "relatedTopics": ["检测", "保养记录", "购车注意事项"]
    },
    {
      "id": "condition_002",
      "category": "condition",
      "keywords": ["空调", "冷气", "检查", "维修", "热带", "aircon"],
      "questions": [
        "二手车空调怎么检查？",
        "冷气不冷怎么办？",
        "热带气候用车注意事项",
        "car aircon check"
      ],
      "answer": "东盟热带气候二手车空调检查指南：\n\n**空调系统检查（必查项目）**\n1. **制冷效果**\n   - 出风口温度应低于10°C\n   - 检查制冷剂是否充足\n   - 压缩机工作是否正常\n\n2. **常见故障**\n   - 冷凝器泄漏（高温高湿环境加速老化）\n   - 压缩机离合器磨损\n   - 蒸发器堵塞\n\n3. **维修成本参考**\n   - 加冷媒：200-500令吉\n   - 更换压缩机：2000-4000令吉\n   - 大修空调系统：3000-6000令吉\n\n💡 建议：购买前务必测试空调，维修费用不菲",
      "relatedTopics": ["保养", "维修", "用车成本"]
    },
    {
      "id": "process_001",
      "category": "process",
      "keywords": ["过户", "手续", "流程", "Puspakom", "JPJ", "BPKB"],
      "questions": [
        "马来西亚二手车过户流程？",
        "Puspakom检查是什么？",
        "印尼BPKB过户需要什么？",
        "car ownership transfer"
      ],
      "answer": "东盟各国二手车过户流程：\n\n**马来西亚**\n1. Puspakom车辆检查（必做）\n2. 填写JPJ表格\n3. 买卖双方身份证\n4. 保险过户或新购\n5. 费用：约100-300令吉\n\n**新加坡**\n1. LTA线上过户\n2. 买家需有COE和PARF资格\n3. 费用：按车辆价值计算\n\n**泰国**\n1. 到车管所(DLT)办理\n2. 提供护照/身份证\n3. 车辆检查\n4. 费用：约1000-2000泰铢\n\n**印尼**\n1. BPKB（车辆登记证）过户\n2. STNK（行驶证）更新\n3. 需买卖双方到场\n4. 费用：约200-500万印尼盾\n\n⏱️ 办理时间：通常1-3个工作日",
      "relatedTopics": ["税费", "保险", "注意事项"]
    },
    {
      "id": "process_002",
      "category": "process",
      "keywords": ["贷款", "分期", "Hire Purchase", "车贷", "利率", "loan"],
      "questions": [
        "马来西亚二手车贷款怎么申请？",
        "二手车贷款利率多少？",
        "外国人可以贷款买车吗？",
        "car loan interest rate"
      ],
      "answer": "东盟二手车贷款指南：\n\n**贷款条件**\n- 年龄：21-60岁\n- 收入证明：通常要求月薪3000令吉以上\n- 工作签证（外国人）\n- 车龄一般不超过10年\n\n**利率参考（2024）**\n- 马来西亚：3.5-4.5%（本地银行）\n- 泰国：3-5%\n- 印尼：5-8%\n- 新加坡：2.5-3.5%\n\n**贷款比例**\n- 首付：最低10-20%\n- 期限：最长9年（车龄+贷款期≤10-12年）\n\n**外国人贷款**\n- 需有本地工作签证\n- 部分银行要求担保人\n- 利率可能略高\n\n💡 建议：多比较几家银行利率，差别可能很大",
      "relatedTopics": ["预算", "购车成本", "保险"]
    },
    {
      "id": "recommend_001",
      "category": "recommendation",
      "keywords": ["推荐", "5万", "预算", "买什么车", "入门", "budget"],
      "questions": [
        "5万令吉预算推荐什么二手车？",
        "新手买什么二手车好？",
        "省油耐用的二手车推荐",
        "best used car under 50k"
      ],
      "answer": "5万令吉（约1.5亿印尼盾）预算二手车推荐：\n\n**省油耐用首选**\n1. **丰田 Vios/Yaris**（2018-2020款）\n   - 价格：4-6万令吉\n   - 优点：省油、维修便宜、保值\n\n2. **本田 City/Jazz**（2018-2020款）\n   - 价格：4-6万令吉\n   - 优点：空间大、动力好\n\n3. **马自达 2**（2019-2021款）\n   - 价格：5-7万令吉\n   - 优点：操控好、配置高\n\n**SUV选择**\n1. **本田 HR-V**（2017-2019款）\n   - 价格：6-8万令吉\n\n2. **丰田 C-HR**（2018-2020款）\n   - 价格：7-9万令吉\n\n💡 建议：优先考虑日系车，维修网点多，配件便宜",
      "relatedTopics": ["预算", "省油", "保养"]
    },
    {
      "id": "policy_001",
      "category": "policy",
      "keywords": ["路税", "Road Tax", "保险", "Insurance", "NCD"],
      "questions": [
        "马来西亚路税多少钱？",
        "NCD折扣怎么算？",
        "二手车保险要重新买吗？",
        "car insurance NCD"
      ],
      "answer": "东盟二手车税费保险指南：\n\n**马来西亚路税（Road Tax）**\n- 按发动机排量计算\n- 1.0-1.6L：约20-90令吉/年\n- 1.6-2.0L：约90-380令吉/年\n- 2.0L以上：约380-4000+令吉/年\n\n**保险NCD（无索赔折扣）**\n- 第1年：0%\n- 第2年：25%\n- 第3年：30%\n- 第4年：38.33%\n- 第5年及以上：45%（上限）\n\n**重要提示**\n- NCD跟随车主，不跟随车辆\n- 购买二手车后保险需重新计算\n- 可转移NCD到新车辆\n\n**第三方险vs综合险**\n- 第三方险：最便宜，只赔对方\n- 综合险：推荐，保障更全面\n\n💡 建议：购买综合险，东盟交通状况复杂",
      "relatedTopics": ["税费", "预算", "用车成本"]
    },
    {
      "id": "asean_002",
      "category": "asean",
      "keywords": ["Grab", "网约车", "商用", "出租车", "改装", "Gojek"],
      "questions": [
        "什么车适合跑Grab？",
        "网约车推荐什么车型？",
        "跑Grab用车要求？",
        "best car for Grab"
      ],
      "answer": "东盟网约车（Grab/Gojek）用车指南：\n\n**Grab用车要求**\n- 车龄一般不超过10年\n- 4门轿车或MPV\n- 有空调且工作正常\n- 通过Grab车辆检查\n\n**推荐车型**\n1. **丰田 Vios**（最热门）\n   - 省油：市区约6-7L/100km\n   - 维修便宜\n   - 二手价：4-7万令吉\n\n2. **本田 City**\n   - 空间大，乘客舒适\n   - 省油耐用\n\n3. **三菱 Xpander/丰田 Avanza**\n   - 适合Grab 6座\n   - 收入更高\n\n**运营成本参考（每月）**\n- 油费：800-1200令吉\n- 保养：200-400令吉\n- 保险：150-300令吉\n\n💡 建议：购买二手Vios最划算，回本周期短",
      "relatedTopics": ["收入", "成本", "推荐"]
    },
    {
      "id": "asean_003",
      "category": "asean",
      "keywords": ["改装", "改装车", "合法", "包围", "排气", "modification"],
      "questions": [
        "马来西亚改装车合法吗？",
        "什么改装可以通过Puspakom？",
        "改装车过户有影响吗？",
        "car modification legal"
      ],
      "answer": "东盟二手车改装合法性指南：\n\n**马来西亚合法改装**\n- 轮毂：尺寸不可超过原厂±1英寸\n- 车身套件：需申报，不影响安全\n- 排气：噪音不可超过90分贝\n- 悬挂：车身高度有最低限制\n\n**Puspakom检查重点**\n- 改装需有JPJ批准文件\n- 灯光系统符合标准\n- 刹车系统完好\n- 排放达标\n\n**常见非法改装**\n- 大灯爆闪/变色\n- 排气噪音过大\n- 车身过低（<100mm）\n- 轮胎超出轮拱\n\n**过户影响**\n- 非法改装无法通过检查\n- 需恢复原状才能过户\n- 合法改装需携带批准文件\n\n⚠️ 建议：购买前确认改装合法性，避免后续麻烦",
      "relatedTopics": ["过户", "检查", "法规"]
    },
    {
      "id": "byd_001",
      "category": "price",
      "keywords": ["比亚迪", "BYD", "秦", "Qin", "价格", "多少钱", "二手", "新能源"],
      "questions": [
        "比亚迪秦二手多少钱？",
        "BYD Qin二手车价格",
        "秦DM-i二手价格",
        "BYD Qin second hand price"
      ],
      "answer": "比亚迪秦系列二手车价格区间（东盟市场）：\n\n**秦Pro DM（插电混动）**\n• 2019款：6-8万令吉/18-25亿印尼盾\n• 2020款：7-9万令吉/21-28亿印尼盾\n• 2021款：8-10万令吉/24-32亿印尼盾\n\n**秦Plus DM-i**\n• 2021款：9-12万令吉/27-38亿印尼盾\n• 2022款：11-14万令吉/33-44亿印尼盾\n\n**配置参数参考**\n- 发动机：1.5T + 电机\n- 纯电续航：50-120km（视版本）\n- 综合油耗：1.3-2.0L/100km\n- 电池容量：9-18kWh\n\n⚠️ 购买注意：\n1. 检查电池健康度（建议>80%）\n2. 确认充电接口类型（国标/欧标）\n3. 了解当地充电桩分布\n4. 保修政策是否可转让",
      "relatedModels": ["比亚迪 宋", "比亚迪 唐", "本田 Insight", "丰田 Prius"]
    },
    {
      "id": "byd_002",
      "category": "price",
      "keywords": ["比亚迪", "BYD", "唐", "Tang", "SUV", "价格", "二手", "七座"],
      "questions": [
        "比亚迪唐二手多少钱？",
        "BYD Tang二手车价格",
        "唐DM二手价格",
        "BYD Tang second hand price"
      ],
      "answer": "比亚迪唐系列二手车价格区间（东盟市场）：\n\n**唐DM（插电混动版）**\n• 2019款：10-13万令吉/30-40亿印尼盾\n• 2020款：12-15万令吉/36-46亿印尼盾\n• 2021款：14-17万令吉/42-52亿印尼盾\n\n**唐EV（纯电版）**\n• 2020款：13-16万令吉/39-50亿印尼盾\n• 2021款：15-19万令吉/46-60亿印尼盾\n\n**车型亮点**\n- 7座大型SUV，适合大家庭\n- 0-100km/h加速4.3秒（DM版）\n- 纯电续航80-100km（DM版）/400-500km（EV版）\n- 刀片电池技术（高安全性）\n\n**配置参数**\n- 尺寸：4870×1950×1725mm\n- 轴距：2820mm\n- 驱动：双电机四驱\n- 电池：20-86kWh（视版本）",
      "relatedModels": ["比亚迪 宋", "丰田 Fortuner", "三菱 Pajero Sport", "福特 Everest"]
    },
    {
      "id": "byd_003",
      "category": "recommendation",
      "keywords": ["比亚迪", "BYD", "宋", "Song", "SUV", "推荐", "配置"],
      "questions": [
        "比亚迪宋怎么样？",
        "BYD Song值得买吗？",
        "宋Pro和宋Plus区别",
        "BYD Song review"
      ],
      "answer": "比亚迪宋系列车型详解：\n\n**宋Pro DM-i（紧凑型SUV）**\n• 新车价：约12-15万令吉\n• 二手价（2021-2022）：9-12万令吉\n• 尺寸：4650×1860×1700mm\n• 轴距：2712mm\n• 动力：1.5L + 电机，综合功率173kW\n• 纯电续航：51-110km\n\n**宋Plus DM-i（A+级SUV）**\n• 新车价：约14-17万令吉\n• 二手价（2021-2022）：11-14万令吉\n• 尺寸：4705×1890×1680mm\n• 轴距：2765mm\n• 动力：1.5L + 电机，综合功率173-265kW\n• 纯电续航：51-110km\n\n**适合人群**\n✅ 需要大空间SUV的家庭\n✅ 有充电条件的城市用户\n✅ 追求低用车成本的消费者",
      "relatedModels": ["比亚迪 唐", "本田 CR-V", "丰田 RAV4", "马自达 CX-5"]
    },
    {
      "id": "byd_004",
      "category": "recommendation",
      "keywords": ["比亚迪", "BYD", "汉", "Han", "轿车", "旗舰", "配置"],
      "questions": [
        "比亚迪汉怎么样？",
        "BYD Han值得买吗？",
        "汉EV和汉DM区别",
        "BYD Han review"
      ],
      "answer": "比亚迪汉系列 - 旗舰轿车详解：\n\n**汉DM（插电混动版）**\n• 二手价（2020-2021）：12-16万令吉/36-50亿印尼盾\n• 0-100km/h：4.7秒\n• 纯电续航：81km\n• 综合续航：800km+\n\n**汉EV（纯电版）**\n• 二手价（2020-2021）：14-19万令吉/42-60亿印尼盾\n• 续航：506-605km（NEDC）\n• 0-100km/h：3.9秒（四驱版）\n• 电池：77kWh刀片电池\n\n**豪华配置**\n- 尺寸：4960×1910×1495mm，轴距2920mm\n- 内饰：Nappa真皮、实木饰板\n- 科技：15.6英寸旋转屏、DiPilot智驾\n- 音响：Dirac 12扬声器\n\n⚠️ 注意：汉系列在东盟市场较少，配件供应需确认",
      "relatedModels": ["特斯拉 Model 3", "宝马 3系", "奔驰 C级", "丰田 Camry"]
    },
    {
      "id": "byd_005",
      "category": "condition",
      "keywords": ["比亚迪", "BYD", "电池", "刀片电池", "检测", "健康度", "新能源"],
      "questions": [
        "比亚迪电池怎么检测？",
        "刀片电池健康度怎么看？",
        "BYD二手车电池检查",
        "比亚迪电池衰减"
      ],
      "answer": "比亚迪二手车电池检测指南：\n\n**刀片电池特点**\n- 磷酸铁锂技术，安全性高\n- 循环寿命：3000次以上\n- 质保：8年/15万公里（一般可转让）\n\n**电池健康度检测方法**\n\n1. **官方诊断（推荐）**\n   - 前往BYD授权服务中心\n   - 使用专用诊断仪读取SOH\n   - 费用：约200-500令吉\n\n2. **自行检查**\n   - 满电续航 vs 标称续航比例\n   - 健康度>85%：良好\n   - 健康度70-85%：一般，可议价\n   - 健康度<70%：需谨慎考虑\n\n3. **充电观察**\n   - 快充时间是否明显延长\n   - 充电过程中是否异常发热\n   - 电量显示是否跳变\n\n⚠️ 电池更换成本较高，务必仔细检查",
      "relatedModels": ["特斯拉", "蔚来", "小鹏", "理想"]
    },
    {
      "id": "byd_006",
      "category": "policy",
      "keywords": ["比亚迪", "BYD", "新能源", "免税", "补贴", "路税", "政策"],
      "questions": [
        "马来西亚新能源车免税吗？",
        "BYD在东盟有补贴吗？",
        "电动车路税怎么算？",
        "EV tax exemption ASEAN"
      ],
      "answer": "东盟新能源车政策指南（含BYD）：\n\n**马来西亚**\n- 进口税：纯电动车全免（至2025年）\n- 消费税（SST）：全免\n- 路税：按电机功率计算，比燃油车便宜50-70%\n- 例子：BYD Atto 3路税约100令吉/年\n\n**泰国**\n- 进口税：降至0%（2024-2025年）\n- 消费税：从8%降至2%\n- 每辆车补贴：约7-15万泰铢\n\n**新加坡**\n- VES环保税：A1级最高回扣2.5万新元\n- ARF优惠：电动车40%折扣\n\n**印尼**\n- 增值税：从11%降至1%（2024年）\n- 进口关税：0%\n\n💡 建议：购买前咨询当地JPJ/LTA/DMV确认最新政策",
      "relatedTopics": ["税费", "路税", "政策", "电动车"]
    }
  ],
  
  "synonyms": {
    "丰田": ["Toyota", "toyota", "豐田"],
    "本田": ["Honda", "honda"],
    "三菱": ["Mitsubishi", "mitsubishi"],
    "宝马": ["BMW", "bmw"],
    "奔驰": ["Mercedes", "Benz", "benz", "Merc"],
    "奥迪": ["Audi", "audi"],
    "福特": ["Ford", "ford"],
    "日产": ["Nissan", "nissan"],
    "马自达": ["Mazda", "mazda"],
    "比亚迪": ["BYD", "byd", "比亞迪"],
    "秦": ["Qin", "qin", "秦Pro", "秦Plus", "秦DM"],
    "唐": ["Tang", "tang", "唐DM", "唐EV"],
    "宋": ["Song", "song", "宋Pro", "宋Plus", "宋DM", "宋EV"],
    "汉": ["Han", "han", "汉EV", "汉DM"],
    "价格": ["多少钱", "价位", "行情", "报价", "harga", "price"],
    "二手": ["二手车", "旧车", "used", "second hand"],
    "过户": ["过户手续", "过户流程", "转移登记", "ownership transfer"],
    "事故车": ["事故", "碰撞", "大事故", "accident"],
    "空调": ["冷气", "aircon", "AC", "空调系统"],
    "贷款": ["分期", "按揭", "loan", "hire purchase"]
  },
  
  "greetings": {
    "zh": ["你好", "您好", "嗨", "hello", "hi"],
    "th": ["สวัสดี", "หวัดดี", "sawasdee"],
    "ms": ["selamat", "hai", "hello"],
    "id": ["halo", "selamat", "hai"],
    "vi": ["xin chào", "chào", "hello"],
    "ph": ["kamusta", "hello", "hi"],
    "responses": {
      "zh": [
        "您好！我是东盟二手车AI助手，有什么可以帮您的吗？",
        "你好！我可以帮您评估车辆价格、了解车况、解答交易流程问题。",
        "您好！请问有什么关于东盟二手车的问题需要咨询？"
      ],
      "th": [
        "สวัสดีค่ะ/ครับ ฉันคือผู้ช่วย AI รถยนต์มือสองอาเซียน มีอะไรให้ช่วยเหลือไหมคะ/ครับ?",
        "สวัสดีค่ะ/ครับ ฉันสามารถช่วยประเมินราคารถ ตรวจสอบสภาพรถ และตอบคำถามเกี่ยวกับกระบวนการซื้อขายได้ค่ะ/ครับ",
        "สวัสดีค่ะ/ครับ มีคำถามเกี่ยวกับรถยนต์มือสองในอาเซียนสงสัยอะไรไหมคะ/ครับ?"
      ],
      "ms": [
        "Selamat! Saya pembantu AI kereta terpakai ASEAN. Ada yang boleh saya bantu?",
        "Hai! Saya boleh bantu menilai harga kereta, semak keadaan kereta, dan jawab soalan proses jual beli.",
        "Selamat! Ada soalan tentang kereta terpakai ASEAN yang ingin ditanya?"
      ],
      "id": [
        "Halo! Saya asisten AI mobil bekas ASEAN. Ada yang bisa saya bantu?",
        "Hai! Saya bisa membantu menilai harga mobil, memeriksa kondisi mobil, dan menjawab pertanyaan proses jual beli.",
        "Halo! Ada pertanyaan tentang mobil bekas ASEAN yang ingin ditanyakan?"
      ],
      "vi": [
        "Xin chào! Tôi là trợ lý AI xe ô tô đã qua sử dụng ASEAN. Tôi có thể giúp gì cho bạn?",
        "Chào bạn! Tôi có thể giúp định giá xe, kiểm tra tình trạng xe và giải đáp thắc mắc về quy trình mua bán.",
        "Xin chào! Bạn có câu hỏi nào về xe ô tô đã qua sử dụng ở ASEAN không?"
      ],
      "ph": [
        "Kamusta! Ako ang ASEAN second-hand car AI assistant. Paano kita matutulungan?",
        "Hello! Makakatulong ako sa pagtaya ng presyo ng kotse, pagsusuri ng kondisyon, at pag sagot sa mga tanong tungkol sa proseso ng pagbili at pagbenta.",
        "Kamusta! May mga tanong ka ba tungkol sa second-hand car sa ASEAN?"
      ]
    }
  },
  
  "fallback_responses": {
    "zh": [
      "抱歉，我可能没有完全理解您的问题。您可以尝试问我：\n1. \"丰田Hilux二手多少钱？\"\n2. \"怎么判断水淹车？\"\n3. \"马来西亚过户需要什么手续？\"",
      "这个问题我还需要学习一下 😅 您可以换个方式问，或者咨询具体的车价、车况、流程等问题。",
      "不好意思，我不太确定您想了解什么。我是东盟二手车助手，可以帮您估价、查车况、了解交易流程~"
    ],
    "th": [
      "ขออภัยค่ะ/ครับ ฉันอาจไม่เข้าใจคำถามของคุณ ลองถามว่า:\n1. \"Toyota Hilux ราคาเท่าไหร่\"\n2. \"ตรวจสอบรถน้ำท่วมยังไง\"\n3. \"โอนรถที่มาเลเซียต้องทำยังไง\"",
      "ขอโทษค่ะ/ครับ ฉันยังไม่เข้าใจคำถามนี้ 😅 ลองถามใหม่ หรือถามเรื่องราคารถ สภาพรถ กระบวนการซื้อขายได้ค่ะ/ครับ",
      "ขออภัยค่ะ/ครับ ฉันไม่แน่ใจว่าคุณอยากรู้อะไร ฉันคือผู้ช่วยรถมือสองอาเซียน ช่วยประเมินราคา ตรวจสภาพรถ แนะนำกระบวนการซื้อขายได้ค่ะ/ครับ~"
    ],
    "ms": [
      "Maaf, saya mungkin tidak faham sepenuhnya soalan anda. Cuba tanya:\n1. \"Berapa harga Toyota Hilux terpakai?\"\n2. \"Macam mana nak semak kereta banjir?\"\n3. \"Apa prosedur pindah milik di Malaysia?\"",
      "Maaf, saya masih perlu belajar tentang soalan ini 😅 Cuba tanya dengan cara lain, atau tanya tentang harga kereta, keadaan kereta, proses jual beli.",
      "Maaf, saya tidak pasti apa yang anda mahu tahu. Saya pembantu kereta terpakai ASEAN, boleh bantu nilai harga, semak keadaan kereta, proses jual beli~"
    ],
    "id": [
      "Maaf, saya mungkin tidak sepenuhnya memahami pertanyaan Anda. Coba tanya:\n1. \"Berapa harga Toyota Hilux bekas?\"\n2. \"Bagaimana cara memeriksa mobil banjir?\"\n3. \"Apa prosedur balik nama di Malaysia?\"",
      "Maaf, saya masih perlu belajar tentang pertanyaan ini 😅 Coba tanya dengan cara lain, atau tanya tentang harga mobil, kondisi mobil, proses jual beli.",
      "Maaf, saya tidak yakin apa yang ingin Anda ketahui. Saya asisten mobil bekas ASEAN, bisa membantu penilaian harga, pemeriksaan kondisi, proses jual beli~"
    ],
    "vi": [
      "Xin lỗi, tôi có thể chưa hiểu hoàn toàn câu hỏi của bạn. Hãy thử hỏi:\n1. \"Giá xe Toyota Hilux cũ bao nhiêu?\"\n2. \"Làm thế nào để kiểm tra xe ngập nước?\"\n3. \"Thủ tục sang tên xe ở Malaysia như thế nào?\"",
      "Xin lỗi, tôi vẫn cần học về câu hỏi này 😅 Hãy thử hỏi theo cách khác, hoặc hỏi về giá xe, tình trạng xe, quy trình mua bán.",
      "Xin lỗi, tôi không chắc bạn muốn biết điều gì. Tôi là trợ lý xe ô tô đã qua sử dụng ASEAN, có thể giúp định giá, kiểm tra tình trạng, quy trình mua bán~"
    ],
    "ph": [
      "Pasensya na, baka hindi ko lubos na naintindihan ang tanong mo. Subukang magtanong:\n1. \"Magkano ang presyo ng Toyota Hilux na second-hand?\"\n2. \"Paano suriin ang kotse na binaha?\"\n3. \"Ano ang proseso ng paglipat ng pagmamay-ari sa Malaysia?\"",
      "Pasensya na, kailangan ko pang matuto tungkol sa tanong na ito 😅 Subukang magtanong sa ibang paraan, o magtanong tungkol sa presyo ng kotse, kondisyon, proseso ng pagbili at pagbenta.",
      "Pasensya na, hindi ako sigurado kung ano ang gusto mong malaman. Ako ang ASEAN second-hand car assistant, makakatulong sa pagtaya ng presyo, pagsusuri ng kondisyon, proseso ng pagbili at pagbenta~"
    ]
  }
};

// 停用词集合
const STOP_WORDS = new Set([
    '的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', 
    '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这', '那', 
    '啊', '吗', '呢', '吧', '嘛', '什么', '怎么', '多少'
]);

export class LocalDatabase {
    constructor() {
        this.qaPairs = knowledgeBase.qa_pairs || [];
        this.synonyms = knowledgeBase.synonyms || {};
        this.greetings = knowledgeBase.greetings || {};
        this.fallbackResponses = knowledgeBase.fallback_responses || {};
        this.searchIndex = this.buildSearchIndex();
        this.currentLanguage = 'zh'; // 默认中文
        
        console.log('[LocalDatabase] 初始化完成，知识库条目:', this.qaPairs.length);
    }

    /**
     * 从本地 JSON 文件加载扩展知识库
     * @param {string} jsonPath - JSON 文件路径
     * @returns {number} 加载的新条目数
     */
    async loadExtendedKnowledgeBase(jsonPath = './data/knowledgeBase.ext.json') {
        try {
            const response = await fetch(jsonPath);
            if (!response.ok) {
                if (response.status !== 404) {
                    console.warn(`[LocalDatabase] 扩展知识库加载失败: HTTP ${response.status}`);
                } else {
                    console.log('[LocalDatabase] 扩展知识库文件不存在，使用默认数据');
                }
                return 0;
            }
            
            const data = await response.json();
            const extendedPairs = data.qa_pairs || [];
            
            if (extendedPairs.length > 0) {
                // 合并扩展数据，避免重复
                const existingIds = new Set(this.qaPairs.map(qa => qa.id));
                const newPairs = extendedPairs.filter(qa => !existingIds.has(qa.id));
                
                if (newPairs.length > 0) {
                    this.qaPairs = [...this.qaPairs, ...newPairs];
                    // 注意：不在这里重建索引，让调用方统一重建
                    console.log(`[LocalDatabase] 已加载扩展知识库: ${newPairs.length} 条，总计: ${this.qaPairs.length} 条`);
                    return newPairs.length;
                } else {
                    console.log('[LocalDatabase] 扩展知识库数据已全部存在，跳过');
                }
            }
            return 0;
        } catch (error) {
            console.warn('[LocalDatabase] 加载扩展知识库失败:', error.message);
            return 0;
        }
    }

    /**
     * 重建搜索索引
     */
    rebuildIndex() {
        this.searchIndex = this.buildSearchIndex();
        console.log('[LocalDatabase] 搜索索引已重建');
    }

    /**
     * 动态添加知识条目
     * @param {Object} qaPair - 知识条目
     */
    addQAPair(qaPair) {
        // 生成ID
        if (!qaPair.id) {
            const timestamp = Date.now().toString(36);
            const count = this.qaPairs.length + 1;
            qaPair.id = `${qaPair.category || 'general'}_${timestamp}_${count}`;
        }
        
        // 添加来源标记
        if (!qaPair.source) {
            qaPair.source = 'dynamic';
        }
        
        this.qaPairs.push(qaPair);
        this.searchIndex = this.buildSearchIndex();
        
        console.log('[LocalDatabase] 添加知识条目:', qaPair.id);
        return qaPair.id;
    }

    /**
     * 批量添加知识条目
     * @param {Object[]} qaPairs - 知识条目数组
     */
    addQAPairs(qaPairs) {
        const added = [];
        for (const qa of qaPairs) {
            const id = this.addQAPair(qa);
            added.push(id);
        }
        return added;
    }

    /**
     * 从JSON加载知识库（合并模式）
     * @param {Object} jsonData - 知识库JSON对象
     * @param {boolean} merge - 是否合并（true）还是替换（false）
     */
    loadFromJSON(jsonData, merge = true) {
        const qaPairs = jsonData.qa_pairs || jsonData;
        
        if (!Array.isArray(qaPairs)) {
            throw new Error('无效的JSON格式：期望数组或包含qa_pairs的对象');
        }
        
        if (!merge) {
            // 替换模式：只保留内置条目
            this.qaPairs = this.qaPairs.filter(qa => qa.source !== 'custom' && qa.source !== 'dynamic');
        }
        
        // 添加新条目
        const added = this.addQAPairs(qaPairs);
        
        console.log(`[LocalDatabase] 从JSON加载了 ${added.length} 条知识`);
        return added;
    }

    /**
     * 删除知识条目
     * @param {string} id - 条目ID
     */
    removeQAPair(id) {
        const index = this.qaPairs.findIndex(qa => qa.id === id);
        if (index !== -1) {
            const removed = this.qaPairs.splice(index, 1);
            this.searchIndex = this.buildSearchIndex();
            console.log('[LocalDatabase] 删除知识条目:', id);
            return removed[0];
        }
        return null;
    }

    /**
     * 获取所有动态添加的条目
     */
    getDynamicEntries() {
        return this.qaPairs.filter(qa => qa.source === 'dynamic' || qa.source === 'custom');
    }

    /**
     * 清空动态添加的条目
     */
    clearDynamicEntries() {
        const count = this.qaPairs.length;
        this.qaPairs = this.qaPairs.filter(qa => qa.source !== 'dynamic' && qa.source !== 'custom');
        this.searchIndex = this.buildSearchIndex();
        const removed = count - this.qaPairs.length;
        console.log('[LocalDatabase] 清空动态条目:', removed);
        return removed;
    }

    /**
     * 检测语言 - 支持所有东盟主要语言
     */
    detectLanguage(text) {
        if (!text || typeof text !== 'string') return 'zh';
        
        const lowerText = text.toLowerCase();
        
        // 泰语检测 (泰语Unicode范围: \u0E00-\u0E7F)
        const thaiRegex = /[\u0E00-\u0E7F]/;
        if (thaiRegex.test(text)) {
            return 'th';
        }
        
        // 越南语检测 (越南语特有字符)
        const vietnameseRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
        if (vietnameseRegex.test(text)) {
            return 'vi';
        }
        
        // 马来语检测
        const malayWords = ['kereta', 'harga', 'jual', 'beli', 'tangan', 'second', 'murah', 'mahal', 'baru', 'lama', 'puspakom', 'jpj'];
        if (malayWords.some(word => lowerText.includes(word))) {
            return 'ms';
        }
        
        // 印尼语检测
        const indonesianWords = ['mobil', 'harga', 'jual', 'beli', 'bekas', 'baru', 'murah', 'mahal', 'bagus', 'bpkb', 'stnk'];
        if (indonesianWords.some(word => lowerText.includes(word))) {
            return 'id';
        }
        
        // 菲律宾语/塔加洛语检测
        const tagalogWords = ['kamusta', 'magkano', 'presyo', 'kotse', 'sasakyan', 'bili', 'benta', 'mura', 'mahal', 'gusto', 'ko'];
        if (tagalogWords.some(word => lowerText.includes(word))) {
            return 'ph';
        }
        
        // 缅甸语检测 (缅甸语Unicode范围: \u1000-\u109F)
        const myanmarRegex = /[\u1000-\u109F]/;
        if (myanmarRegex.test(text)) {
            return 'my';
        }
        
        // 高棉语(柬埔寨)检测 (高棉语Unicode范围: \u1780-\u17FF)
        const khmerRegex = /[\u1780-\u17FF]/;
        if (khmerRegex.test(text)) {
            return 'kh';
        }
        
        // 老挝语检测 (老挝语Unicode范围: \u0E80-\u0EFF)
        const laoRegex = /[\u0E80-\u0EFF]/;
        if (laoRegex.test(text)) {
            return 'lo';
        }
        
        // 默认中文
        return 'zh';
    }

    /**
     * 设置当前语言
     */
    setLanguage(lang) {
        this.currentLanguage = lang;
    }

    /**
     * 构建搜索索引
     */
    buildSearchIndex() {
        const index = [];
        
        this.qaPairs.forEach(qa => {
            const allTexts = [
                ...qa.questions,
                ...qa.keywords,
                qa.id
            ].join(' ');
            
            index.push({
                id: qa.id,
                category: qa.category,
                keywords: qa.keywords,
                text: allTexts.toLowerCase(),
                answer: qa.answer,
                relatedModels: qa.relatedModels || [],
                relatedTopics: qa.relatedTopics || []
            });
        });
        
        return index;
    }

    /**
     * 搜索匹配的QA
     */
    search(query, topK = CONFIG.DEFAULT_TOP_K) {
        console.log('[LocalDatabase] 搜索:', query);
        
        // 检测并设置语言
        this.currentLanguage = this.detectLanguage(query);
        console.log('[LocalDatabase] 检测语言:', this.currentLanguage);
        
        const normalizedQuery = this.normalizeText(query);
        const queryWords = this.extractKeywords(normalizedQuery);
        
        console.log('[LocalDatabase] 提取关键词:', queryWords);
        
        if (queryWords.length === 0) {
            return { results: [], isGreeting: false, isFallback: true, language: this.currentLanguage };
        }

        // 检查是否是问候语
        if (this.isGreeting(normalizedQuery)) {
            return { 
                results: [], 
                isGreeting: true, 
                isFallback: false,
                greetingResponse: this.getGreetingResponse(),
                language: this.currentLanguage
            };
        }

        // 计算每个索引项的匹配分数
        const scores = this.searchIndex.map(item => {
            const score = this.calculateMatchScore(queryWords, item);
            return { ...item, score };
        });

        // 排序并返回topK
        const results = scores
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, topK);

        console.log('[LocalDatabase] 匹配结果数:', results.length);

        return {
            results,
            isGreeting: false,
            isFallback: results.length === 0,
            fallbackResponse: results.length === 0 ? this.getFallbackResponse() : null,
            language: this.currentLanguage
        };
    }

    /**
     * 计算匹配分数
     */
    calculateMatchScore(queryWords, indexItem) {
        let score = 0;
        const itemText = indexItem.text;
        const itemKeywords = indexItem.keywords.map(k => k.toLowerCase());

        queryWords.forEach(word => {
            // 完全匹配关键词（权重最高）
            if (itemKeywords.includes(word)) {
                score += CONFIG.KEYWORD_MATCH_WEIGHT;
            }
            
            // 部分匹配关键词
            itemKeywords.forEach(keyword => {
                if (keyword.includes(word) || word.includes(keyword)) {
                    score += CONFIG.PARTIAL_MATCH_WEIGHT;
                }
            });

            // 匹配问题文本
            if (itemText.includes(word)) {
                score += CONFIG.TEXT_MATCH_WEIGHT;
            }

            // 同义词匹配
            const synonyms = this.getSynonyms(word);
            synonyms.forEach(syn => {
                if (itemText.includes(syn)) {
                    score += CONFIG.SYNONYM_MATCH_WEIGHT;
                }
            });
        });

        // 匹配越多关键词，分数加成
        const matchedKeywords = queryWords.filter(w => 
            itemKeywords.some(k => k.includes(w) || w.includes(k))
        );
        score += matchedKeywords.length * CONFIG.MATCH_BONUS_WEIGHT;

        return score;
    }

    /**
     * 标准化文本
     */
    normalizeText(text) {
        if (typeof text !== 'string') return '';
        return text
            .toLowerCase()
            .replace(/[，。？！,.?!、]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * 提取关键词
     */
    extractKeywords(text) {
        if (typeof text !== 'string') return [];
        const words = text.split(/\s+/);
        
        return words.filter(w => w.length > 1 && !STOP_WORDS.has(w));
    }

    /**
     * 获取同义词
     */
    getSynonyms(word) {
        const synonyms = [word];
        
        for (const [key, values] of Object.entries(this.synonyms)) {
            if (key === word || values.includes(word)) {
                synonyms.push(key, ...values);
            }
        }
        
        return [...new Set(synonyms)];
    }

    /**
     * 检查是否是问候语
     */
    isGreeting(text) {
        const lang = this.detectLanguage(text);
        const greetings = this.greetings[lang] || this.greetings.zh || [];
        const lowerText = text.toLowerCase();
        return greetings.some(g => {
            // 对于非拉丁字符，直接比较；对于拉丁字符，转小写比较
            const greetingLower = g.toLowerCase();
            return lowerText.includes(greetingLower);
        });
    }

    /**
     * 获取问候语回复
     */
    getGreetingResponse() {
        const responses = this.greetings.responses?.[this.currentLanguage] || 
                         this.greetings.responses?.['zh'] || 
                         ['您好！有什么可以帮您的吗？'];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    /**
     * 获取兜底回复
     */
    getFallbackResponse() {
        const responses = this.fallbackResponses[this.currentLanguage] || 
                         this.fallbackResponses['zh'] || 
                         ['抱歉，我不太理解您的问题。'];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    /**
     * 获取最佳答案
     */
    getBestAnswer(query) {
        console.log('[LocalDatabase] getBestAnswer:', query);
        
        const searchResult = this.search(query, 1);
        
        if (searchResult.isGreeting) {
            return {
                found: true,
                answer: searchResult.greetingResponse,
                source: 'greeting',
                confidence: 1.0,
                language: searchResult.language
            };
        }
        
        if (searchResult.isFallback || searchResult.results.length === 0) {
            return {
                found: false,
                answer: searchResult.fallbackResponse,
                source: 'fallback',
                confidence: 0,
                language: searchResult.language
            };
        }

        const bestMatch = searchResult.results[0];
        // 使用配置的基准分数计算置信度
        const confidence = Math.min(bestMatch.score / CONFIG.CONFIDENCE_BASE_SCORE, 1.0);

        return {
            found: true,
            answer: bestMatch.answer,
            source: 'database',
            confidence: confidence,
            matchedId: bestMatch.id,
            category: bestMatch.category,
            relatedModels: bestMatch.relatedModels,
            relatedTopics: bestMatch.relatedTopics,
            allMatches: searchResult.results,
            language: searchResult.language
        };
    }

    /**
     * 获取相关推荐
     */
    getRecommendations(matchedId, limit = CONFIG.MAX_RECOMMENDATIONS) {
        const matchedItem = this.qaPairs.find(qa => qa.id === matchedId);
        if (!matchedItem) return [];

        const recommendations = [];
        const addedIds = new Set([matchedId]);
        
        // 基于相关车型推荐
        if (matchedItem.relatedModels) {
            matchedItem.relatedModels.forEach(model => {
                const related = this.qaPairs.find(qa => 
                    !addedIds.has(qa.id) && 
                    qa.keywords.some(k => model.includes(k) || k.includes(model))
                );
                if (related) {
                    recommendations.push(related);
                    addedIds.add(related.id);
                }
            });
        }

        // 基于相关主题推荐
        if (matchedItem.relatedTopics) {
            matchedItem.relatedTopics.forEach(topic => {
                const related = this.qaPairs.find(qa => 
                    !addedIds.has(qa.id) && 
                    qa.keywords.some(k => topic.includes(k) || k.includes(topic))
                );
                if (related) {
                    recommendations.push(related);
                    addedIds.add(related.id);
                }
            });
        }

        // 基于相同类别推荐
        const sameCategory = this.qaPairs.filter(qa => 
            !addedIds.has(qa.id) && 
            qa.category === matchedItem.category
        );
        
        for (const qa of sameCategory) {
            if (recommendations.length >= limit) break;
            recommendations.push(qa);
            addedIds.add(qa.id);
        }

        return recommendations.slice(0, limit).map(qa => ({
            id: qa.id,
            question: qa.questions[0],
            keywords: qa.keywords
        }));
    }

    /**
     * 获取统计数据
     */
    getStats() {
        const categories = [...new Set(this.qaPairs.map(qa => qa.category))];
        const totalKeywords = this.qaPairs.reduce((sum, qa) => sum + (qa.keywords?.length || 0), 0);
        
        return {
            totalQAPairs: this.qaPairs.length,
            categories: categories,
            categoryCount: categories.length,
            totalKeywords: totalKeywords,
            synonymsCount: Object.keys(this.synonyms).length
        };
    }
}

export default LocalDatabase;

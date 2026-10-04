export const recipes = Object.freeze([
  {
    id: '01-pesto-pasta',
    title: 'Паста с песто',
    category: 'pasta',
    summary: 'Базилик, пармезан и паста аль денте.',
    difficulty: 'easy',
    totalMinutes: 25,
    servings: 4,
    ingredients: [
      {
        id: 'spaghetti',
        amount: 340,
        unit: 'g',
      },
      {
        id: 'pesto',
        amount: 80,
        unit: 'ml',
      },
      {
        id: 'parmesan',
        amount: 40,
        unit: 'g',
        note: 'и ещё немного для подачи',
      },
      {
        id: 'basil',
        amount: 8,
        unit: 'leaf',
      },
      {
        id: 'pasta-water',
        amount: [120, 240],
        unit: 'ml',
        scalable: false,
      },
      {
        id: 'salt',
        amount: null,
        unit: 'taste',
      },
      {
        id: 'black-pepper',
        amount: null,
        unit: 'taste',
      },
    ],
    steps: [
      {
        title: 'Подготовьте ингредиенты',
        text: 'Отмерьте песто, натрите пармезан на мелкой тёрке и промойте базилик.',
      },
      {
        title: 'Сварите пасту',
        text: 'Вскипятите большую кастрюлю воды и посолите. Опустите спагетти и варите до состояния аль денте — обычно на минуту меньше, чем указано на упаковке.',
        timerMinutes: 9,
      },
      {
        title: 'Сохраните воду',
        text: 'Перед тем как сливать, отлейте в мерный кувшин около 240 мл воды от пасты: крахмал в ней поможет соусу стать шелковистым.',
      },
      {
        title: 'Откиньте пасту',
        text: 'Слейте спагетти через дуршлаг и слегка встряхните, не промывая.',
      },
      {
        title: 'Соедините с соусом',
        text: 'В миске смешайте пасту, песто и 120 мл сохранённой воды. Если соус густой, добавьте ещё немного воды.',
        note: 'Без нагрева',
      },
      {
        title: 'Подавайте',
        text: 'Разложите пасту по тарелкам, посыпьте пармезаном, добавьте листья базилика и свежемолотый перец. Подавайте сразу.',
      },
    ],
    activeMinutes: 15,
  },
  {
    id: '02-omelette',
    title: 'Омлет с сыром',
    category: 'breakfast',
    summary: '',
    difficulty: 'easy',
    totalMinutes: 10,
    servings: 2,
    ingredients: [],
    steps: [
      {
        title: 'Разбить яйца в миску',
        text: '',
      },
      {
        title: 'Взбить яйца венчиком с молоком',
        text: '',
      },
      {
        title: 'Натереть сыр на тёрке',
        text: '',
      },
      {
        title: 'Вылить яичную смесь на сковороду с маслом',
        text: '',
      },
      {
        title: 'Посыпать сыром и сложить схватившийся омлет пополам',
        text: '',
      },
      {
        title: 'Подать омлет на тарелке',
        text: '',
      },
    ],
  },
  {
    id: '03-syrniki',
    title: 'Сырники',
    category: 'breakfast',
    summary: '',
    difficulty: 'easy',
    totalMinutes: 30,
    servings: 4,
    ingredients: [],
    steps: [
      {
        title: 'Размять творог в миске',
        text: '',
      },
      {
        title: 'Добавить яйцо и сахар и перемешать',
        text: '',
      },
      {
        title: 'Вмешать муку до густой творожной массы',
        text: '',
      },
      {
        title: 'Сформировать круглые сырники и слегка обвалять в муке',
        text: '',
      },
      {
        title: 'Обжарить с двух сторон до золотистой корочки',
        text: '',
      },
      {
        title: 'Подать со сметаной и ягодами',
        text: '',
      },
    ],
  },
  {
    id: '04-oatmeal',
    title: 'Овсяная каша с бананом',
    category: 'breakfast',
    summary: '',
    difficulty: 'easy',
    totalMinutes: 15,
    servings: 2,
    ingredients: [],
    steps: [
      {
        title: 'Насыпать овсяные хлопья в сотейник',
        text: '',
      },
      {
        title: 'Влить молоко и немного воды',
        text: '',
      },
      {
        title: 'Варить кашу при помешивании деревянной ложкой',
        text: '',
      },
      {
        title: 'Нарезать банан кружочками',
        text: '',
      },
      {
        title: 'Переложить густую кашу в миску',
        text: '',
      },
      {
        title: 'Добавить банан, орехи и немного мёда',
        text: '',
      },
    ],
  },
  {
    id: '05-shakshuka',
    title: 'Шакшука',
    category: 'breakfast',
    summary: '',
    difficulty: 'easy',
    totalMinutes: 35,
    servings: 4,
    ingredients: [],
    steps: [
      {
        title: 'Нарезать лук и сладкий перец',
        text: '',
      },
      {
        title: 'Обжарить овощи в глубокой сковороде',
        text: '',
      },
      {
        title: 'Добавить измельчённые томаты и специи',
        text: '',
      },
      {
        title: 'Потушить томатный соус и сделать в нём углубления',
        text: '',
      },
      {
        title: 'Разбить яйца в углубления и готовить под крышкой',
        text: '',
      },
      {
        title: 'Подать яйца в томатном соусе с зеленью и хлебом',
        text: '',
      },
    ],
  },
  {
    id: '06-french-toast',
    title: 'Французские тосты',
    category: 'breakfast',
    summary: '',
    difficulty: 'easy',
    totalMinutes: 20,
    servings: 4,
    ingredients: [],
    steps: [
      {
        title: 'Нарезать батон толстыми ломтиками',
        text: '',
      },
      {
        title: 'Взбить яйца с молоком и щепоткой корицы',
        text: '',
      },
      {
        title: 'Обмакнуть хлеб в яичную смесь с двух сторон',
        text: '',
      },
      {
        title: 'Растопить сливочное масло на сковороде',
        text: '',
      },
      {
        title: 'Обжарить пропитанный хлеб с двух сторон',
        text: '',
      },
      {
        title: 'Подать тосты с ягодами и мёдом',
        text: '',
      },
    ],
  },
  {
    id: '07-avocado-toast',
    title: 'Тост с авокадо и яйцом',
    category: 'breakfast',
    summary: '',
    difficulty: 'easy',
    totalMinutes: 15,
    servings: 2,
    ingredients: [],
    steps: [
      {
        title: 'Разрезать авокадо и удалить косточку',
        text: '',
      },
      {
        title: 'Вынуть мякоть ложкой и размять с лимонным соком',
        text: '',
      },
      {
        title: 'Подрумянить хлеб в тостере',
        text: '',
      },
      {
        title: 'Пожарить яйцо на небольшой сковороде',
        text: '',
      },
      {
        title: 'Намазать авокадо на тост и положить сверху яйцо',
        text: '',
      },
      {
        title: 'Посыпать перцем и зеленью и подать',
        text: '',
      },
    ],
  },
  {
    id: '08-borscht',
    title: 'Борщ',
    category: 'soup',
    summary: '',
    difficulty: 'medium',
    totalMinutes: 90,
    servings: 6,
    ingredients: [],
    steps: [
      {
        title: 'Сварить мясной бульон в большой кастрюле',
        text: '',
      },
      {
        title: 'Нарезать картофель и нашинковать капусту',
        text: '',
      },
      {
        title: 'Натереть свёклу и морковь и нарезать лук',
        text: '',
      },
      {
        title: 'Потушить свёклу с томатной пастой и отдельно обжарить лук с морковью',
        text: '',
      },
      {
        title: 'Добавить овощи в бульон и сварить до мягкости',
        text: '',
      },
      {
        title: 'Подать борщ со сметаной и зеленью',
        text: '',
      },
    ],
  },
  {
    id: '09-chicken-noodle-soup',
    title: 'Куриный суп с лапшой',
    category: 'soup',
    summary: '',
    difficulty: 'easy',
    totalMinutes: 60,
    servings: 6,
    ingredients: [],
    steps: [
      {
        title: 'Сварить куриный бульон',
        text: '',
      },
      {
        title: 'Вынуть готовую курицу и разделить мясо на кусочки',
        text: '',
      },
      {
        title: 'Нарезать морковь, лук и картофель',
        text: '',
      },
      {
        title: 'Добавить овощи в бульон и варить до мягкости',
        text: '',
      },
      {
        title: 'Добавить лапшу и курицу и довести суп до готовности',
        text: '',
      },
      {
        title: 'Подать суп с рубленой зеленью',
        text: '',
      },
    ],
  },
  {
    id: '10-pumpkin-soup',
    title: 'Тыквенный суп-пюре',
    category: 'soup',
    summary: '',
    difficulty: 'easy',
    totalMinutes: 45,
    servings: 4,
    ingredients: [],
    steps: [
      {
        title: 'Очистить тыкву и нарезать кубиками',
        text: '',
      },
      {
        title: 'Нарезать лук и чеснок',
        text: '',
      },
      {
        title: 'Обжарить лук и чеснок в кастрюле',
        text: '',
      },
      {
        title: 'Добавить тыкву и бульон и варить до мягкости',
        text: '',
      },
      {
        title: 'Измельчить суп погружным блендером и добавить сливки',
        text: '',
      },
      {
        title: 'Подать крем-суп с тыквенными семечками',
        text: '',
      },
    ],
  },
  {
    id: '11-lentil-soup',
    title: 'Чечевичный суп',
    category: 'soup',
    summary: '',
    difficulty: 'easy',
    totalMinutes: 40,
    servings: 4,
    ingredients: [],
    steps: [
      {
        title: 'Промыть красную чечевицу в сите',
        text: '',
      },
      {
        title: 'Нарезать лук, морковь и томаты',
        text: '',
      },
      {
        title: 'Обжарить лук и морковь в кастрюле',
        text: '',
      },
      {
        title: 'Добавить чечевицу, томаты и воду',
        text: '',
      },
      {
        title: 'Варить до мягкости чечевицы и слегка измельчить блендером',
        text: '',
      },
      {
        title: 'Подать с долькой лимона и зеленью',
        text: '',
      },
    ],
  },
  {
    id: '12-mushroom-soup',
    title: 'Грибной суп',
    category: 'soup',
    summary: '',
    difficulty: 'easy',
    totalMinutes: 40,
    servings: 4,
    ingredients: [],
    steps: [
      {
        title: 'Нарезать шампиньоны пластинками',
        text: '',
      },
      {
        title: 'Нарезать картофель, морковь и лук',
        text: '',
      },
      {
        title: 'Обжарить грибы на сковороде',
        text: '',
      },
      {
        title: 'Сварить картофель в кастрюле с водой',
        text: '',
      },
      {
        title: 'Добавить грибы и обжаренные овощи и довести до готовности',
        text: '',
      },
      {
        title: 'Подать грибной суп со сметаной',
        text: '',
      },
    ],
  },
  {
    id: '13-greek-salad',
    title: 'Греческий салат',
    category: 'salad',
    summary: '',
    difficulty: 'easy',
    totalMinutes: 15,
    servings: 4,
    ingredients: [],
    steps: [
      {
        title: 'Нарезать помидоры крупными дольками',
        text: '',
      },
      {
        title: 'Нарезать огурцы и сладкий перец',
        text: '',
      },
      {
        title: 'Нарезать красный лук полукольцами',
        text: '',
      },
      {
        title: 'Сложить овощи в миску и добавить оливки',
        text: '',
      },
      {
        title: 'Положить кубики феты и полить оливковым маслом',
        text: '',
      },
      {
        title: 'Посыпать орегано и аккуратно перемешать',
        text: '',
      },
    ],
  },
  {
    id: '14-caesar',
    title: 'Цезарь с курицей',
    category: 'salad',
    summary: '',
    difficulty: 'medium',
    totalMinutes: 30,
    servings: 4,
    ingredients: [],
    steps: [
      {
        title: 'Поджарить кубики хлеба до сухариков',
        text: '',
      },
      {
        title: 'Обжарить куриное филе до полной готовности',
        text: '',
      },
      {
        title: 'Нарезать готовую курицу ломтиками',
        text: '',
      },
      {
        title: 'Промыть, обсушить и порвать листья салата',
        text: '',
      },
      {
        title: 'Смешать листья с готовым соусом цезарь',
        text: '',
      },
      {
        title: 'Выложить курицу, сухарики и тонкие стружки пармезана',
        text: '',
      },
    ],
  },
  {
    id: '15-caprese',
    title: 'Капрезе',
    category: 'salad',
    summary: '',
    difficulty: 'easy',
    totalMinutes: 10,
    servings: 2,
    ingredients: [],
    steps: [
      {
        title: 'Вымыть и обсушить помидоры',
        text: '',
      },
      {
        title: 'Нарезать помидоры круглыми ломтиками',
        text: '',
      },
      {
        title: 'Нарезать моцареллу круглыми ломтиками',
        text: '',
      },
      {
        title: 'Чередуя выложить помидоры и моцареллу на тарелку',
        text: '',
      },
      {
        title: 'Добавить свежие листья базилика',
        text: '',
      },
      {
        title: 'Полить оливковым маслом и посыпать перцем',
        text: '',
      },
    ],
  },
  {
    id: '16-vinaigrette',
    title: 'Винегрет',
    category: 'salad',
    summary: '',
    difficulty: 'easy',
    totalMinutes: 60,
    servings: 6,
    ingredients: [],
    steps: [
      {
        title: 'Отварить свёклу в отдельной кастрюле',
        text: '',
      },
      {
        title: 'Отварить картофель и морковь и остудить',
        text: '',
      },
      {
        title: 'Очистить варёные овощи и нарезать кубиками',
        text: '',
      },
      {
        title: 'Нарезать солёные огурцы и лук',
        text: '',
      },
      {
        title: 'Соединить овощи с зелёным горошком в миске',
        text: '',
      },
      {
        title: 'Заправить растительным маслом и перемешать',
        text: '',
      },
    ],
  },
  {
    id: '17-tuna-salad',
    title: 'Салат с тунцом и фасолью',
    category: 'salad',
    summary: '',
    difficulty: 'easy',
    totalMinutes: 15,
    servings: 4,
    ingredients: [],
    steps: [
      {
        title: 'Слить жидкость с консервированной фасоли',
        text: '',
      },
      {
        title: 'Слить жидкость с тунца и разделить его вилкой',
        text: '',
      },
      {
        title: 'Нарезать помидоры и красный лук',
        text: '',
      },
      {
        title: 'Сложить фасоль, тунец и овощи в миску',
        text: '',
      },
      {
        title: 'Смешать оливковое масло с лимонным соком',
        text: '',
      },
      {
        title: 'Полить салат заправкой и добавить петрушку',
        text: '',
      },
    ],
  },
  {
    id: '18-bolognese',
    title: 'Спагетти болоньезе',
    category: 'pasta',
    summary: '',
    difficulty: 'medium',
    totalMinutes: 60,
    servings: 4,
    ingredients: [],
    steps: [
      {
        title: 'Мелко нарезать лук, морковь и сельдерей',
        text: '',
      },
      {
        title: 'Обжарить овощи в глубокой сковороде',
        text: '',
      },
      {
        title: 'Добавить фарш и обжарить, разбивая комочки',
        text: '',
      },
      {
        title: 'Добавить измельчённые томаты и тушить мясной соус',
        text: '',
      },
      {
        title: 'Сварить спагетти и откинуть на дуршлаг',
        text: '',
      },
      {
        title: 'Смешать пасту с соусом и подать с пармезаном',
        text: '',
      },
    ],
  },
  {
    id: '19-carbonara',
    title: 'Карбонара',
    category: 'pasta',
    summary: '',
    difficulty: 'medium',
    totalMinutes: 25,
    servings: 4,
    ingredients: [],
    steps: [
      {
        title: 'Нарезать гуанчиале небольшими брусочками',
        text: '',
      },
      {
        title: 'Обжарить гуанчиале без дополнительного масла',
        text: '',
      },
      {
        title: 'Смешать желтки, тёртый пекорино и чёрный перец',
        text: '',
      },
      {
        title: 'Сварить спагетти и сохранить немного воды',
        text: '',
      },
      {
        title: 'Вне огня смешать пасту с гуанчиале и яично-сырной смесью',
        text: '',
      },
      {
        title: 'Добавить немного воды до кремовой текстуры и подать',
        text: '',
      },
    ],
  },
  {
    id: '20-mushroom-pasta',
    title: 'Паста с грибами в сливках',
    category: 'pasta',
    summary: '',
    difficulty: 'easy',
    totalMinutes: 30,
    servings: 4,
    ingredients: [],
    steps: [
      {
        title: 'Нарезать шампиньоны и чеснок',
        text: '',
      },
      {
        title: 'Обжарить грибы до румяного цвета',
        text: '',
      },
      {
        title: 'Добавить чеснок и сливки и слегка уварить соус',
        text: '',
      },
      {
        title: 'Сварить феттучине в кастрюле',
        text: '',
      },
      {
        title: 'Переложить пасту в грибной соус и перемешать',
        text: '',
      },
      {
        title: 'Подать с пармезаном и петрушкой',
        text: '',
      },
    ],
  },
  {
    id: '21-lasagna',
    title: 'Лазанья',
    category: 'pasta',
    summary: '',
    difficulty: 'hard',
    totalMinutes: 90,
    servings: 6,
    ingredients: [],
    steps: [
      {
        title: 'Обжарить фарш с луком и добавить томаты',
        text: '',
      },
      {
        title: 'Потушить мясной томатный соус',
        text: '',
      },
      {
        title: 'Приготовить бешамель из масла, муки и молока',
        text: '',
      },
      {
        title: 'Выложить слоями листы лазаньи, мясной соус и бешамель',
        text: '',
      },
      {
        title: 'Посыпать сыром и запечь до готовности листов',
        text: '',
      },
      {
        title: 'Дать лазанье немного постоять и подать кусок',
        text: '',
      },
    ],
  },
  {
    id: '22-mac-cheese',
    title: 'Макароны с сыром',
    category: 'pasta',
    summary: '',
    difficulty: 'easy',
    totalMinutes: 35,
    servings: 4,
    ingredients: [],
    steps: [
      {
        title: 'Сварить макароны и откинуть на дуршлаг',
        text: '',
      },
      {
        title: 'Растопить сливочное масло в сотейнике',
        text: '',
      },
      {
        title: 'Добавить муку и перемешать лопаткой',
        text: '',
      },
      {
        title: 'Постепенно влить молоко и размешать венчиком',
        text: '',
      },
      {
        title: 'Добавить тёртый сыр и перемешать до однородности',
        text: '',
      },
      {
        title: 'Соединить макароны с сырным соусом и подать',
        text: '',
      },
    ],
  },
  {
    id: '23-roast-chicken',
    title: 'Курица с картофелем в духовке',
    category: 'meat',
    summary: '',
    difficulty: 'easy',
    totalMinutes: 70,
    servings: 4,
    ingredients: [],
    steps: [
      {
        title: 'Нарезать картофель крупными дольками',
        text: '',
      },
      {
        title: 'Смешать масло, паприку, чеснок и соль',
        text: '',
      },
      {
        title: 'Натереть куриные бёдра смесью специй',
        text: '',
      },
      {
        title: 'Выложить курицу и картофель в форму',
        text: '',
      },
      {
        title: 'Запечь до полной готовности курицы и мягкости картофеля',
        text: '',
      },
      {
        title: 'Подать румяную курицу с картофелем и зеленью',
        text: '',
      },
    ],
  },
  {
    id: '24-beef-stroganoff',
    title: 'Бефстроганов',
    category: 'meat',
    summary: '',
    difficulty: 'medium',
    totalMinutes: 40,
    servings: 4,
    ingredients: [],
    steps: [
      {
        title: 'Нарезать говядину тонкими полосками',
        text: '',
      },
      {
        title: 'Нарезать лук полукольцами',
        text: '',
      },
      {
        title: 'Быстро обжарить мясо порциями',
        text: '',
      },
      {
        title: 'Обжарить лук и добавить немного муки',
        text: '',
      },
      {
        title: 'Добавить сметану и бульон, вернуть мясо и потушить',
        text: '',
      },
      {
        title: 'Подать бефстроганов с картофельным пюре',
        text: '',
      },
    ],
  },
  {
    id: '25-meatballs',
    title: 'Тефтели в томатном соусе',
    category: 'meat',
    summary: '',
    difficulty: 'medium',
    totalMinutes: 50,
    servings: 4,
    ingredients: [],
    steps: [
      {
        title: 'Сварить рис до полуготовности',
        text: '',
      },
      {
        title: 'Смешать фарш, рис, яйцо и мелко нарезанный лук',
        text: '',
      },
      {
        title: 'Сформировать круглые тефтели',
        text: '',
      },
      {
        title: 'Слегка обжарить тефтели на сковороде',
        text: '',
      },
      {
        title: 'Добавить томатный соус и тушить под крышкой до готовности',
        text: '',
      },
      {
        title: 'Подать тефтели с рисом и зеленью',
        text: '',
      },
    ],
  },
  {
    id: '26-chicken-curry',
    title: 'Куриное карри',
    category: 'meat',
    summary: '',
    difficulty: 'medium',
    totalMinutes: 40,
    servings: 4,
    ingredients: [],
    steps: [
      {
        title: 'Нарезать куриное филе кубиками',
        text: '',
      },
      {
        title: 'Мелко нарезать лук, чеснок и имбирь',
        text: '',
      },
      {
        title: 'Обжарить лук и ароматные специи в глубокой сковороде',
        text: '',
      },
      {
        title: 'Добавить курицу и обжарить',
        text: '',
      },
      {
        title: 'Влить кокосовое молоко и тушить до полной готовности',
        text: '',
      },
      {
        title: 'Подать карри с варёным рисом',
        text: '',
      },
    ],
  },
  {
    id: '27-pilaf',
    title: 'Плов',
    category: 'meat',
    summary: '',
    difficulty: 'medium',
    totalMinutes: 90,
    servings: 6,
    ingredients: [],
    steps: [
      {
        title: 'Промыть рис в миске до прозрачной воды',
        text: '',
      },
      {
        title: 'Нарезать мясо, лук и морковь',
        text: '',
      },
      {
        title: 'Обжарить мясо и овощи в казане',
        text: '',
      },
      {
        title: 'Добавить воду и специи и потушить основу',
        text: '',
      },
      {
        title: 'Выложить рис и головку чеснока и готовить под крышкой',
        text: '',
      },
      {
        title: 'Перемешать готовый плов и выложить на блюдо',
        text: '',
      },
    ],
  },
  {
    id: '28-chicken-cutlets',
    title: 'Куриные котлеты',
    category: 'meat',
    summary: '',
    difficulty: 'easy',
    totalMinutes: 35,
    servings: 4,
    ingredients: [],
    steps: [
      {
        title: 'Замочить хлеб в молоке',
        text: '',
      },
      {
        title: 'Мелко нарезать лук',
        text: '',
      },
      {
        title: 'Смешать куриный фарш, хлеб, лук и яйцо',
        text: '',
      },
      {
        title: 'Сформировать овальные котлеты и обвалять в сухарях',
        text: '',
      },
      {
        title: 'Обжарить с двух сторон и довести до полной готовности под крышкой',
        text: '',
      },
      {
        title: 'Подать котлеты с овощами и картофелем',
        text: '',
      },
    ],
  },
  {
    id: '29-baked-salmon',
    title: 'Лосось с лимоном',
    category: 'fish',
    summary: '',
    difficulty: 'easy',
    totalMinutes: 25,
    servings: 4,
    ingredients: [],
    steps: [
      {
        title: 'Выложить филе лосося в форму',
        text: '',
      },
      {
        title: 'Полить оливковым маслом и посыпать солью и перцем',
        text: '',
      },
      {
        title: 'Нарезать лимон тонкими кружочками',
        text: '',
      },
      {
        title: 'Положить лимон и укроп на рыбу',
        text: '',
      },
      {
        title: 'Запечь рыбу до готовности',
        text: '',
      },
      {
        title: 'Подать филе с лимоном и овощами',
        text: '',
      },
    ],
  },
  {
    id: '30-fish-cakes',
    title: 'Рыбные котлеты',
    category: 'fish',
    summary: '',
    difficulty: 'medium',
    totalMinutes: 40,
    servings: 4,
    ingredients: [],
    steps: [
      {
        title: 'Нарезать рыбное филе кусочками',
        text: '',
      },
      {
        title: 'Замочить хлеб в молоке',
        text: '',
      },
      {
        title: 'Измельчить рыбу и лук в кухонном комбайне',
        text: '',
      },
      {
        title: 'Смешать рыбный фарш, хлеб и яйцо и сформировать котлеты',
        text: '',
      },
      {
        title: 'Обвалять котлеты в сухарях и обжарить до полной готовности',
        text: '',
      },
      {
        title: 'Подать рыбные котлеты с салатом',
        text: '',
      },
    ],
  },
  {
    id: '31-garlic-shrimp',
    title: 'Креветки с чесноком',
    category: 'fish',
    summary: '',
    difficulty: 'easy',
    totalMinutes: 15,
    servings: 2,
    ingredients: [],
    steps: [
      {
        title: 'Очистить креветки от панциря',
        text: '',
      },
      {
        title: 'Мелко нарезать чеснок и петрушку',
        text: '',
      },
      {
        title: 'Растопить сливочное масло в сковороде',
        text: '',
      },
      {
        title: 'Добавить чеснок и затем креветки',
        text: '',
      },
      {
        title: 'Обжарить креветки до непрозрачной розовой мякоти',
        text: '',
      },
      {
        title: 'Полить лимонным соком и посыпать петрушкой',
        text: '',
      },
    ],
  },
  {
    id: '32-cod-tomato',
    title: 'Треска в томатном соусе',
    category: 'fish',
    summary: '',
    difficulty: 'easy',
    totalMinutes: 35,
    servings: 4,
    ingredients: [],
    steps: [
      {
        title: 'Нарезать лук и чеснок',
        text: '',
      },
      {
        title: 'Обжарить лук и чеснок в глубокой сковороде',
        text: '',
      },
      {
        title: 'Добавить томаты и потушить соус',
        text: '',
      },
      {
        title: 'Выложить куски трески в соус',
        text: '',
      },
      {
        title: 'Готовить под крышкой до готовности рыбы',
        text: '',
      },
      {
        title: 'Подать треску с томатным соусом и базиликом',
        text: '',
      },
    ],
  },
  {
    id: '33-fish-soup',
    title: 'Уха',
    category: 'fish',
    summary: '',
    difficulty: 'medium',
    totalMinutes: 50,
    servings: 6,
    ingredients: [],
    steps: [
      {
        title: 'Нарезать картофель и морковь крупными кусочками',
        text: '',
      },
      {
        title: 'Варить овощи с целой луковицей в кастрюле',
        text: '',
      },
      {
        title: 'Подготовить очищенные порционные куски рыбы',
        text: '',
      },
      {
        title: 'Добавить рыбу и лавровый лист в овощной отвар',
        text: '',
      },
      {
        title: 'Варить на слабом огне до готовности рыбы',
        text: '',
      },
      {
        title: 'Подать уху с укропом',
        text: '',
      },
    ],
  },
  {
    id: '34-ratatouille',
    title: 'Рататуй',
    category: 'vegetable',
    summary: '',
    difficulty: 'medium',
    totalMinutes: 75,
    servings: 4,
    ingredients: [],
    steps: [
      {
        title: 'Нарезать баклажан, кабачок и помидоры кружочками',
        text: '',
      },
      {
        title: 'Нарезать лук и сладкий перец',
        text: '',
      },
      {
        title: 'Потушить лук, перец и измельчённые томаты для соуса',
        text: '',
      },
      {
        title: 'Распределить соус в форме и выложить сверху чередующиеся овощные кружочки',
        text: '',
      },
      {
        title: 'Полить маслом, добавить травы и запечь до мягкости',
        text: '',
      },
      {
        title: 'Подать веер запечённых овощей с томатным соусом',
        text: '',
      },
    ],
  },
  {
    id: '35-potato-gratin',
    title: 'Картофельный гратен',
    category: 'vegetable',
    summary: '',
    difficulty: 'medium',
    totalMinutes: 80,
    servings: 6,
    ingredients: [],
    steps: [
      {
        title: 'Очистить картофель',
        text: '',
      },
      {
        title: 'Нарезать картофель тонкими кружочками',
        text: '',
      },
      {
        title: 'Смешать сливки с измельчённым чесноком',
        text: '',
      },
      {
        title: 'Выложить картофель слоями в форму и залить сливками',
        text: '',
      },
      {
        title: 'Посыпать тёртым сыром и запечь до мягкости',
        text: '',
      },
      {
        title: 'Подать кусок гратена с золотистой сырной корочкой',
        text: '',
      },
    ],
  },
  {
    id: '36-stuffed-peppers',
    title: 'Перцы с рисом и овощами',
    category: 'vegetable',
    summary: '',
    difficulty: 'medium',
    totalMinutes: 70,
    servings: 4,
    ingredients: [],
    steps: [
      {
        title: 'Сварить рис до полуготовности',
        text: '',
      },
      {
        title: 'Срезать верхушки перцев и вынуть семена',
        text: '',
      },
      {
        title: 'Нарезать и обжарить лук, морковь и кабачок',
        text: '',
      },
      {
        title: 'Смешать рис с овощами и наполнить перцы',
        text: '',
      },
      {
        title: 'Поставить перцы в форму с томатным соусом и запечь',
        text: '',
      },
      {
        title: 'Подать целый фаршированный перец с соусом',
        text: '',
      },
    ],
  },
  {
    id: '37-falafel',
    title: 'Фалафель',
    category: 'vegetable',
    summary: '',
    difficulty: 'medium',
    totalMinutes: 45,
    servings: 4,
    ingredients: [],
    steps: [
      {
        title: 'Замочить сухой нут на ночь и затем слить воду',
        text: '',
      },
      {
        title: 'Мелко нарезать лук, чеснок и зелень',
        text: '',
      },
      {
        title: 'Измельчить замоченный нут с луком, зеленью и специями',
        text: '',
      },
      {
        title: 'Сформировать небольшие круглые шарики',
        text: '',
      },
      {
        title: 'Обжарить шарики в горячем масле до готовности',
        text: '',
      },
      {
        title: 'Подать фалафель с тахинным соусом и овощами',
        text: '',
      },
    ],
  },
  {
    id: '38-buckwheat-mushrooms',
    title: 'Гречка с грибами',
    category: 'vegetable',
    summary: '',
    difficulty: 'easy',
    totalMinutes: 35,
    servings: 4,
    ingredients: [],
    steps: [
      {
        title: 'Промыть гречневую крупу в сите',
        text: '',
      },
      {
        title: 'Сварить гречку в кастрюле под крышкой',
        text: '',
      },
      {
        title: 'Нарезать шампиньоны и лук',
        text: '',
      },
      {
        title: 'Обжарить лук и грибы на сковороде',
        text: '',
      },
      {
        title: 'Добавить варёную гречку и перемешать',
        text: '',
      },
      {
        title: 'Подать с зеленью в глубокой тарелке',
        text: '',
      },
    ],
  },
  {
    id: '39-pizza',
    title: 'Пицца маргарита',
    category: 'baking',
    summary: '',
    difficulty: 'medium',
    totalMinutes: 90,
    servings: 4,
    ingredients: [],
    steps: [
      {
        title: 'Смешать муку, воду, дрожжи, соль и масло',
        text: '',
      },
      {
        title: 'Замесить тесто и дать ему подняться',
        text: '',
      },
      {
        title: 'Растянуть тесто в круг на противне',
        text: '',
      },
      {
        title: 'Намазать томатным соусом и разложить моцареллу',
        text: '',
      },
      {
        title: 'Выпечь пиццу до готовности теста и расплавления сыра',
        text: '',
      },
      {
        title: 'Добавить базилик и нарезать пиццу на куски',
        text: '',
      },
    ],
  },
  {
    id: '40-khachapuri',
    title: 'Хачапури по-аджарски',
    category: 'baking',
    summary: '',
    difficulty: 'hard',
    totalMinutes: 100,
    servings: 2,
    ingredients: [],
    steps: [
      {
        title: 'Замесить дрожжевое тесто и дать ему подняться',
        text: '',
      },
      {
        title: 'Натереть сыр и смешать для начинки',
        text: '',
      },
      {
        title: 'Раскатать тесто и сформировать лодочку с бортиками',
        text: '',
      },
      {
        title: 'Наполнить лодочку сыром и запечь',
        text: '',
      },
      {
        title: 'Добавить яйцо в середину и допечь до схватывания белка',
        text: '',
      },
      {
        title: 'Подать с кусочком сливочного масла в центре',
        text: '',
      },
    ],
  },
  {
    id: '41-apple-pie',
    title: 'Яблочная шарлотка',
    category: 'baking',
    summary: '',
    difficulty: 'easy',
    totalMinutes: 60,
    servings: 8,
    ingredients: [],
    steps: [
      {
        title: 'Нарезать яблоки тонкими дольками',
        text: '',
      },
      {
        title: 'Взбить яйца с сахаром до пышной массы',
        text: '',
      },
      {
        title: 'Аккуратно вмешать муку',
        text: '',
      },
      {
        title: 'Выложить яблоки в смазанную форму и залить тестом',
        text: '',
      },
      {
        title: 'Выпечь до золотистой корочки и готовности середины',
        text: '',
      },
      {
        title: 'Остудить и подать ломтик шарлотки',
        text: '',
      },
    ],
  },
  {
    id: '42-banana-bread',
    title: 'Банановый хлеб',
    category: 'baking',
    summary: '',
    difficulty: 'easy',
    totalMinutes: 75,
    servings: 8,
    ingredients: [],
    steps: [
      {
        title: 'Размять спелые бананы вилкой',
        text: '',
      },
      {
        title: 'Смешать бананы с яйцами, сахаром и растопленным маслом',
        text: '',
      },
      {
        title: 'Смешать муку и разрыхлитель',
        text: '',
      },
      {
        title: 'Соединить сухую и влажную смеси',
        text: '',
      },
      {
        title: 'Переложить тесто в прямоугольную форму и выпечь',
        text: '',
      },
      {
        title: 'Остудить банановый хлеб и нарезать ломтиками',
        text: '',
      },
    ],
  },
  {
    id: '43-blueberry-muffins',
    title: 'Маффины с черникой',
    category: 'baking',
    summary: '',
    difficulty: 'easy',
    totalMinutes: 40,
    servings: 12,
    ingredients: [],
    steps: [
      {
        title: 'Смешать муку, сахар и разрыхлитель',
        text: '',
      },
      {
        title: 'В другой миске смешать яйца, молоко и растопленное масло',
        text: '',
      },
      {
        title: 'Соединить две смеси без долгого вымешивания',
        text: '',
      },
      {
        title: 'Аккуратно вмешать чернику',
        text: '',
      },
      {
        title: 'Разложить тесто по бумажным формочкам и выпечь',
        text: '',
      },
      {
        title: 'Остудить румяные маффины на решётке',
        text: '',
      },
    ],
  },
  {
    id: '44-cinnamon-rolls',
    title: 'Булочки с корицей',
    category: 'baking',
    summary: '',
    difficulty: 'hard',
    totalMinutes: 150,
    servings: 12,
    ingredients: [],
    steps: [
      {
        title: 'Замесить дрожжевое тесто и дать ему подняться',
        text: '',
      },
      {
        title: 'Раскатать тесто в большой прямоугольник',
        text: '',
      },
      {
        title: 'Смазать маслом и посыпать сахаром с корицей',
        text: '',
      },
      {
        title: 'Свернуть рулет и нарезать его на булочки',
        text: '',
      },
      {
        title: 'Уложить булочки в форму, дать подняться и выпечь',
        text: '',
      },
      {
        title: 'Покрыть тёплые булочки белой глазурью',
        text: '',
      },
    ],
  },
  {
    id: '45-tiramisu',
    title: 'Тирамису без сырых яиц',
    category: 'dessert',
    summary: '',
    difficulty: 'medium',
    totalMinutes: 270,
    servings: 6,
    ingredients: [],
    steps: [
      {
        title: 'Сварить кофе и остудить',
        text: '',
      },
      {
        title: 'Взбить сливки с сахарной пудрой',
        text: '',
      },
      {
        title: 'Аккуратно соединить сливки с маскарпоне',
        text: '',
      },
      {
        title: 'Быстро обмакнуть савоярди в кофе',
        text: '',
      },
      {
        title: 'Выложить слоями печенье и крем и охладить',
        text: '',
      },
      {
        title: 'Перед подачей посыпать какао',
        text: '',
      },
    ],
  },
  {
    id: '46-panna-cotta',
    title: 'Панна-котта',
    category: 'dessert',
    summary: '',
    difficulty: 'easy',
    totalMinutes: 260,
    servings: 4,
    ingredients: [],
    steps: [
      {
        title: 'Замочить желатин в холодной воде',
        text: '',
      },
      {
        title: 'Нагреть сливки с сахаром и ванилью без кипения',
        text: '',
      },
      {
        title: 'Растворить подготовленный желатин в тёплых сливках',
        text: '',
      },
      {
        title: 'Разлить смесь в небольшие стаканы',
        text: '',
      },
      {
        title: 'Охладить в холодильнике до застывания',
        text: '',
      },
      {
        title: 'Подать с ягодным соусом',
        text: '',
      },
    ],
  },
  {
    id: '47-chocolate-mousse',
    title: 'Шоколадный мусс без сырых яиц',
    category: 'dessert',
    summary: '',
    difficulty: 'medium',
    totalMinutes: 140,
    servings: 4,
    ingredients: [],
    steps: [
      {
        title: 'Нарезать шоколад небольшими кусочками',
        text: '',
      },
      {
        title: 'Растопить шоколад на водяной бане',
        text: '',
      },
      {
        title: 'Дать шоколаду остыть до тёплого состояния',
        text: '',
      },
      {
        title: 'Взбить охлаждённые сливки до мягких пиков',
        text: '',
      },
      {
        title: 'Аккуратно вмешать шоколад и разложить по стаканам',
        text: '',
      },
      {
        title: 'Охладить мусс и подать с шоколадной стружкой',
        text: '',
      },
    ],
  },
  {
    id: '48-no-bake-cheesecake',
    title: 'Чизкейк без выпечки',
    category: 'dessert',
    summary: '',
    difficulty: 'medium',
    totalMinutes: 300,
    servings: 8,
    ingredients: [],
    steps: [
      {
        title: 'Измельчить печенье в крошку',
        text: '',
      },
      {
        title: 'Смешать крошку с растопленным маслом и утрамбовать в форму',
        text: '',
      },
      {
        title: 'Взбить сливочный сыр с сахарной пудрой',
        text: '',
      },
      {
        title: 'Смешать сырную массу со взбитыми сливками и подготовленным желатином',
        text: '',
      },
      {
        title: 'Выложить крем на основу и охладить до застывания',
        text: '',
      },
      {
        title: 'Подать кусок чизкейка с ягодами',
        text: '',
      },
    ],
  },
  {
    id: '49-brownies',
    title: 'Брауни',
    category: 'dessert',
    summary: '',
    difficulty: 'easy',
    totalMinutes: 45,
    servings: 9,
    ingredients: [],
    steps: [
      {
        title: 'Растопить шоколад со сливочным маслом',
        text: '',
      },
      {
        title: 'Взбить яйца с сахаром',
        text: '',
      },
      {
        title: 'Соединить яичную и шоколадную смеси',
        text: '',
      },
      {
        title: 'Вмешать муку и какао',
        text: '',
      },
      {
        title: 'Переложить тесто в квадратную форму и выпечь',
        text: '',
      },
      {
        title: 'Остудить и нарезать брауни на квадраты',
        text: '',
      },
    ],
  },
  {
    id: '50-baked-apples',
    title: 'Запечённые яблоки',
    category: 'dessert',
    summary: '',
    difficulty: 'easy',
    totalMinutes: 45,
    servings: 4,
    ingredients: [],
    steps: [
      {
        title: 'Вырезать сердцевины яблок, оставив дно',
        text: '',
      },
      {
        title: 'Порубить орехи',
        text: '',
      },
      {
        title: 'Смешать орехи, изюм, мёд и корицу',
        text: '',
      },
      {
        title: 'Наполнить яблоки ореховой смесью',
        text: '',
      },
      {
        title: 'Поставить в форму и запечь до мягкости',
        text: '',
      },
      {
        title: 'Подать тёплые яблоки с ложкой йогурта',
        text: '',
      },
    ],
  },
]);

const recipesById = new Map(recipes.map((recipe) => [recipe.id, recipe]));

export function getRecipe(recipeId) {
  return recipesById.get(recipeId) ?? null;
}

export function hasRecipe(recipeId) {
  return recipesById.has(recipeId);
}

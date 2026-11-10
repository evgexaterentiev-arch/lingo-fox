import type { Locale, VocabularyWord } from '../types';
import { lessons } from './course';

const word = (id: string, english: string, russian: string, ukrainian: string, transcription: string, example: string): VocabularyWord => ({
  id, english, russian, ukrainian, transcription, example,
});

export const lessonVocabulary: Record<string, VocabularyWord[]> = {
  'hello-1': [word('hello', 'Hello', 'Привет', 'Привіт', 'хэ-лоу', 'Hello, my friend!'), word('name', 'name', 'имя', 'ім’я', 'нэйм', 'My name is Lina.'), word('meet', 'meet', 'встречать / знакомиться', 'зустрічати / знайомитися', 'мит', 'Nice to meet you!')],
  'hello-2': [word('how', 'how', 'как', 'як', 'хау', 'How are you?'), word('fine', 'fine', 'хорошо', 'добре', 'файн', 'I am fine.'), word('morning', 'morning', 'утро', 'ранок', 'морнинг', 'Good morning!')],
  'hello-3': [word('goodbye', 'Goodbye', 'до свидания', 'до побачення', 'гуд-бай', 'Goodbye, see you later!'), word('later', 'later', 'позже', 'пізніше', 'лэйтэр', 'See you later.'), word('care', 'care', 'забота / заботиться', 'турбота / піклуватися', 'кэр', 'Take care!')],
  'hello-4': [word('please', 'please', 'пожалуйста', 'будь ласка', 'плиз', 'Water, please.'), word('sorry', 'sorry', 'извини(те)', 'вибач(те)', 'сори', 'I am sorry.'), word('welcome', 'welcome', 'добро пожаловать / не за что', 'ласкаво просимо / нема за що', 'вэлкам', "You're welcome.")],
  'food-1': [word('bread', 'bread', 'хлеб', 'хліб', 'брэд', 'I like fresh bread.'), word('coffee', 'coffee', 'кофе', 'кава', 'кофи', 'I love coffee.'), word('eggs', 'eggs', 'яйца', 'яйця', 'эгз', 'I want eggs.')],
  'food-2': [word('apple', 'apple', 'яблоко', 'яблуко', 'эпл', 'An apple is red.'), word('banana', 'banana', 'банан', 'банан', 'бэнэна', 'I like bananas.'), word('orange', 'orange', 'апельсин', 'апельсин', 'ориндж', 'This orange is sweet.')],
  'food-3': [word('water', 'water', 'вода', 'вода', 'уотэр', 'Drink water every day.'), word('tea', 'tea', 'чай', 'чай', 'ти', 'Can I have tea?'), word('juice', 'juice', 'сок', 'сік', 'джус', 'Orange juice, please.')],
  'food-4': [word('menu', 'menu', 'меню', 'меню', 'мэнью', 'Menu, please.'), word('bill', 'bill', 'счёт', 'рахунок', 'бил', 'Can I have the bill?'), word('delicious', 'delicious', 'вкусный', 'смачний', 'дилишэс', 'The soup is delicious.')],
  'city-1': [word('house', 'house', 'дом', 'будинок', 'хаус', 'This is my house.'), word('room', 'room', 'комната', 'кімната', 'рум', 'This is my room.'), word('bedroom', 'bedroom', 'спальня', 'спальня', 'бэдрум', 'I sleep in my bedroom.')],
  'city-2': [word('park', 'park', 'парк', 'парк', 'парк', 'The park is near.'), word('store', 'store', 'магазин', 'магазин', 'стор', 'I go to the store.'), word('school', 'school', 'школа', 'школа', 'скул', 'The school is big.')],
  'city-3': [word('left', 'left', 'налево', 'ліворуч', 'лэфт', 'Turn left.'), word('right', 'right', 'направо', 'праворуч', 'райт', 'Turn right.'), word('straight', 'straight', 'прямо', 'прямо', 'стрэйт', 'Go straight ahead.')],
  'city-4': [word('bus', 'bus', 'автобус', 'автобус', 'бас', 'I take the bus.'), word('metro', 'metro', 'метро', 'метро', 'мэтроу', 'I take the metro.'), word('bike', 'bike', 'велосипед', 'велосипед', 'байк', 'I ride a bike.')],
  'routine-1': [word('wake', 'wake up', 'просыпаться', 'прокидатися', 'вэйк ап', 'I wake up early.'), word('teeth', 'teeth', 'зубы', 'зуби', 'тис', 'I brush my teeth.'), word('dressed', 'get dressed', 'одеваться', 'одягатися', 'гэт дрэст', 'I get dressed quickly.')],
  'routine-2': [word('work', 'work', 'работа / работать', 'робота / працювати', 'ворк', 'I go to work.'), word('start', 'start', 'начинать', 'починати', 'старт', 'I start at 9 AM.'), word('break', 'lunch break', 'обеденный перерыв', 'обідня перерва', 'ланч брэйк', 'I have a lunch break.')],
  'routine-3': [word('home', 'come home', 'приходить домой', 'приходити додому', 'кам хоум', 'I come home at six.'), word('cook', 'cook', 'готовить', 'готувати', 'кук', 'I cook dinner.'), word('relax', 'relax', 'отдыхать', 'відпочивати', 'рилакс', 'I relax in the evening.')],
  'routine-4': [word('sleep', 'sleep', 'спать', 'спати', 'слип', 'I need to sleep.'), word('bed', 'bed', 'кровать', 'ліжко', 'бэд', 'I go to bed at eleven.'), word('tired', 'tired', 'уставший', 'втомлений', 'тайэрд', "I'm tired.")],
};

export const getLessonVocabulary = (lessonId: string) => lessonVocabulary[lessonId] ?? [];

export const getLearnedVocabulary = (completedLessonIds: string[]) => {
  const seen = new Set<string>();
  return completedLessonIds.flatMap((lessonId) => getLessonVocabulary(lessonId)).filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

export const translateWord = (item: VocabularyWord, locale: Locale) => locale === 'uk' ? item.ukrainian : item.russian;

export const getCourseLessonCount = () => lessons.length;

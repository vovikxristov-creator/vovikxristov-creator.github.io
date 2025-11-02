import { Status } from "./types";

export const MANAGERS_LIST = ['Саркаров Тимур', 'Намазов Замир', 'Утебаев Валерий', 'Гаврилов Владимир'] as const;
export const SOURCES_LIST = ['ТГ АИ', 'ТГ рассылка', 'ТГ бот', 'ЯД', 'Сайт', 'Входящий звонок', 'КЦ Лиды', 'От Максима', 'Другое'] as const;

export const KPI_SCORES: Record<string, number> = {
    'ТГ АИ': 1, 'ТГ рассылка': 1, 'ТГ бот': 0.5, 'ЯД': 0.5,
    'Сайт': 0.5, 'Входящий звонок': 0.5, 'КЦ Лиды': 1, 'От Максима': 0.5,
};

export const STATUSES: Record<Status, string> = {
    'New': 'Новый', 'Contacted': 'Связались', 'Qualified': 'Квалифицирован',
    'Proposal Sent': 'Отправлено КП', 'Won': 'Выигран', 'Lost': 'Проигран',
};

export const STATUS_COLORS: Record<Status, string> = {
    'New': 'bg-blue-100 text-blue-800',
    'Contacted': 'bg-yellow-100 text-yellow-800',
    'Qualified': 'bg-purple-100 text-purple-800',
    'Proposal Sent': 'bg-indigo-100 text-indigo-800',
    'Won': 'bg-green-100 text-green-800',
    'Lost': 'bg-red-100 text-red-800',
};

export const PERIOD_OPTIONS = ['all', 'week', 'month', 'quarter', 'year'] as const;

export const PERIOD_NAMES: Record<typeof PERIOD_OPTIONS[number], string> = {
    'all': 'Все время', 'week': 'Неделя', 'month': 'Месяц',
    'quarter': 'Квартал', 'year': 'Год'
};

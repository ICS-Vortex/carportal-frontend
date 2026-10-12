import Link from "next/link";

import { Bell, CarFront, ClipboardList, Droplets, Gauge, ShieldCheck, Wrench } from "lucide-react";

import { PublicHeader } from "@/components/public/public-header";
import { APP_ROUTES } from "@/lib/routes";

const tiles = [
  { icon: CarFront, title: "Гараж" },
  { icon: Wrench, title: "Регламент" },
  { icon: Droplets, title: "Олива і фільтри" },
  { icon: ClipboardList, title: "Журнал СТО" },
  { icon: Bell, title: "Нагадування" }
];

const cabinetCards = [
  {
    title: "Гараж",
    detail: "Марка, покоління, VIN, номер і актуальний пробіг по кожному авто.",
    points: ["Картка автомобіля", "Пробіг", "Фото і номер"]
  },
  {
    title: "Регламент ТО",
    detail: "Роботи з інтервалом у кілометрах і місяцях: що вже зроблено і що наближається.",
    points: ["Інтервал у км", "Інтервал у місяцях", "Статус роботи"]
  },
  {
    title: "Журнал сервісу",
    detail: "Кожен візит: дата, пробіг, станція і список виконаних робіт.",
    points: ["Дата візиту", "Пробіг", "Виконані роботи"]
  }
];

const reasons = [
  { icon: Gauge, title: "Пробіг під рукою" },
  { icon: Wrench, title: "План робіт по авто" },
  { icon: ClipboardList, title: "Історія візитів" },
  { icon: Bell, title: "Нагадування вчасно" },
  { icon: ShieldCheck, title: "Окремий кабінет" },
  { icon: CarFront, title: "Кілька авто в гаражі" }
];

export function PublicHome() {
  return (
    <div id="top" className="shop-site min-h-screen">
      <PublicHeader />
      <main>
        <section className="shop-hero">
          <div className="mx-auto grid min-h-[78vh] max-w-7xl items-end gap-10 px-4 pb-28 pt-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:pb-36">
            <div>
              <p className="shop-kicker">Сервіс автомобіля</p>
              <h1 className="display mt-4 max-w-3xl text-4xl leading-[0.95] text-white sm:text-6xl">
                Тримайте сервіс авто під контролем.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/85 sm:text-lg">
                Carmain веде гараж, регламент ТО, пробіг і журнал візитів. Публічна сторінка знайомить із сервісом. Після входу відкривається ваш кабінет.
              </p>
              <Link href={APP_ROUTES.auth} className="shop-btn mt-8">
                Увійти до кабінету
              </Link>
            </div>
            <div className="mx-auto w-full max-w-2xl lg:mx-0">
              <img
                src="/car-repair.png"
                alt="Обслуговування автомобіля в сервісі"
                width={920}
                height={371}
                decoding="async"
                className="h-auto w-full object-contain drop-shadow-[0_24px_48px_rgba(0,0,0,0.35)]"
              />
            </div>
          </div>
        </section>

        <section id="service" className="relative z-10 mx-auto -mt-16 grid max-w-7xl gap-3 px-4 sm:px-6 sm:grid-cols-2 lg:grid-cols-5">
          {tiles.map((tile) => {
            const Icon = tile.icon;

            return (
              <a key={tile.title} href="#cabinet" className="shop-tile">
                <Icon className="h-8 w-8" strokeWidth={1.6} />
                <span>{tile.title}</span>
              </a>
            );
          })}
        </section>

        <section className="bg-[var(--shop-gray)] py-20 text-white">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="grid grid-cols-2 gap-3">
              <div className="min-h-64 bg-[#2a2a2a] p-5">
                <p className="shop-kicker">Пробіг</p>
                <p className="display mt-8 text-5xl text-white">86 420</p>
                <p className="mt-2 text-xs tracking-[0.16em]">КІЛОМЕТРІВ</p>
              </div>
              <div className="min-h-64 bg-[#c51b1b] p-5">
                <p className="text-xs font-semibold tracking-[0.16em]">НАСТУПНА РОБОТА</p>
                <p className="display mt-8 text-3xl leading-none">Заміна оливи</p>
                <p className="mt-4 text-sm">Орієнтир: через 5 000 км</p>
              </div>
            </div>
            <div>
              <p className="shop-kicker">Що це</p>
              <h2 className="display mt-3 text-4xl leading-none text-[var(--shop-ink)] sm:text-5xl">
                Облік обслуговування для власника авто.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#2f2f2f]">
                У кабінеті зберігаються ваші автомобілі, план робіт і кожен візит на СТО. Регламент показує, яку роботу вже не варто відкладати.
              </p>
              <div className="mt-8 h-px w-24 bg-white/70" />
            </div>
          </div>
        </section>

        <section className="bg-[#6f6f6f] py-16 text-white">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[220px_1fr]">
            <div className="bg-[var(--shop-red)] px-6 py-8">
              <p className="display text-5xl">01</p>
              <p className="mt-2 text-sm">Огляд після входу</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["Гараж", "Усі авто в одному місці, з пробігом і карткою."],
                ["Регламент", "Інтервали виробника по кілометрах і місяцях."],
                ["Журнал", "Дата, станція і список виконаних робіт."]
              ].map(([title, detail]) => (
                <article key={title} className="border-t-2 border-[var(--shop-red)] pt-4">
                  <h3 className="text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/80">{detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="cabinet" className="bg-[var(--shop-charcoal)] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="shop-kicker">Кабінет</p>
                <h2 className="display mt-3 max-w-xl text-4xl leading-none text-white sm:text-5xl">
                  Після входу — ваші авто і план робіт.
                </h2>
              </div>
              <Link href={APP_ROUTES.auth} className="shop-btn">
                Увійти
              </Link>
            </div>
            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {cabinetCards.map((card) => (
                <article key={card.title} className="bg-white p-6 text-[var(--shop-muted)]">
                  <h3 className="text-xl font-semibold text-[var(--shop-ink)]">{card.title}</h3>
                  <p className="mt-3 text-sm leading-6">{card.detail}</p>
                  <ul className="mt-5 space-y-2 text-sm text-[var(--shop-ink)]">
                    {card.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="journal" className="relative overflow-hidden bg-[#1b1b1b] py-24 text-white">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="display text-4xl leading-none sm:text-5xl">
              Регламент знімає здогадки про наступне ТО.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
              Інтервали з плану обслуговування стоять поруч із пробігом і журналом. Кабінет показує найближчу роботу, а не загальний список порад.
            </p>
          </div>
        </section>

        <section className="bg-black py-20 text-white">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
            <div>
              <h2 className="display text-4xl leading-none sm:text-5xl">
                Кабінет тримає сервіс в одному місці.
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-white/75">
                Від заміни оливи до наступного великого ТО: пробіг, план і історія візитів залишаються прив’язаними до конкретного авто.
              </p>
              <div className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {reasons.map((reason) => {
                  const Icon = reason.icon;

                  return (
                    <div key={reason.title} className="flex items-center gap-3 border-b border-white/10 pb-3">
                      <Icon className="h-5 w-5 text-[var(--shop-red)]" />
                      <span className="text-sm font-medium">{reason.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Огляд", "Пробіг і найближча робота"],
                ["Гараж", "Картка кожного авто"],
                ["Журнал", "Візити і станції"],
                ["Профіль", "Дані власника"]
              ].map(([title, detail]) => (
                <article key={title} className="bg-[var(--shop-red)] p-5">
                  <p className="display text-2xl">{title}</p>
                  <p className="mt-2 text-sm text-white/85">{detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[var(--shop-gray)] py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <p className="shop-kicker">Порядок</p>
            <h2 className="display mt-3 text-4xl text-[var(--shop-ink)] sm:text-5xl">Три кроки до кабінету</h2>
            <p className="mt-4 text-sm leading-7 text-[#2f2f2f]">
              Спочатку публічна сторінка. Кабінет відкривається після входу і зберігає лише ваші авто.
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-3">
            {[
              ["01", "Увійдіть", "Email і пароль облікового запису. Той самий акаунт, що створений для порталу."],
              ["02", "Додайте авто", "Покоління, комплектація, рік і поточний пробіг."],
              ["03", "Ведіть сервіс", "Регламент, журнал візитів і нагадування по цьому авто."]
            ].map(([index, title, detail]) => (
              <article key={index} className="border-t-4 border-[var(--shop-red)] bg-white p-6">
                <p className="text-xs font-semibold tracking-[0.16em] text-[var(--shop-red)]">{index}</p>
                <h3 className="mt-4 text-xl font-semibold text-[var(--shop-ink)]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--shop-muted)]">{detail}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <footer className="bg-black text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="bg-[var(--shop-red)] p-6 sm:p-8">
            <h2 className="display max-w-xs text-3xl leading-none">Є авто? Відкрийте кабінет.</h2>
            <Link href={APP_ROUTES.auth} className="mt-6 inline-flex border border-white px-4 py-3 text-xs font-medium tracking-[0.12em] uppercase">
              Увійти
            </Link>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold text-[var(--shop-red)]">Можливості</h3>
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                <li><a href="#service">Гараж</a></li>
                <li><a href="#cabinet">Регламент</a></li>
                <li><a href="#journal">Журнал</a></li>
                <li><a href="#cabinet">Нагадування</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--shop-red)]">Кабінет</h3>
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                <li><Link href={APP_ROUTES.auth}>Вхід</Link></li>
                <li><Link href={APP_ROUTES.dashboard}>Огляд</Link></li>
                <li><Link href={APP_ROUTES.garage}>Гараж</Link></li>
                <li><Link href={APP_ROUTES.profile}>Профіль</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--shop-red)]">Carmain</h3>
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                <li><a href="#top">Головна</a></li>
                <li><a href="#cabinet">Після входу</a></li>
                <li><Link href={APP_ROUTES.maintenance}>Регламент</Link></li>
                <li><Link href={APP_ROUTES.serviceLogs}>Журнал</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-xs text-white/60 sm:px-6">
            <p>Carmain · облік обслуговування авто</p>
            <p className="display text-lg text-[var(--shop-red)]">Carmain</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { contacts } from '../../data/contacts';
import heroPc from '../../assets/hero-pc-2026-cutout.webp';
import customPc from '../../assets/custom-pc-white-cutout.webp';
import './LocalSeoPage.css';

type LocalSeoPageProps = {
  variant: 'gaming' | 'custom' | 'upgrade';
};

const pageCopy = {
  gaming: {
    badge: 'Великий Новгород',
    title: 'Игровые ПК в Великом Новгороде',
    text:
      'TOGOSHOL помогает купить игровой компьютер без хаоса с комплектующими: подбираем готовую сборку под Full HD, 2K или 4K, проверяем температуры и стабильность, готовим систему к запуску.',
    image: heroPc,
    imageAlt: 'Игровой ПК TOGOSHOL для покупки в Великом Новгороде',
    primary: 'Выбрать готовый ПК',
    primaryHref: '/#catalog',
    secondary: 'Собрать под задачу',
    secondaryHref: '/#custom',
  },
  custom: {
    badge: 'Сборка на заказ',
    title: 'Сборка ПК на заказ в Великом Новгороде',
    text:
      'Собираем компьютеры под игры, работу, стриминг и конкретный бюджет. Поможем выбрать процессор, видеокарту, корпус, охлаждение и запас под будущий апгрейд.',
    image: customPc,
    imageAlt: 'Кастомный игровой компьютер TOGOSHOL на заказ в Великом Новгороде',
    primary: 'Описать задачу',
    primaryHref: '/#custom-parts',
    secondary: 'Написать в VK',
    secondaryHref: contacts.vk,
  },
  upgrade: {
    badge: 'Апгрейд ПК',
    title: 'Апгрейд ПК в Великом Новгороде',
    text:
      'Поможем понять, что выгоднее заменить: видеокарту, процессор, память, SSD, блок питания или охлаждение. Проверим совместимость и предложим апгрейд без лишних трат.',
    image: heroPc,
    imageAlt: 'Апгрейд игрового ПК TOGOSHOL в Великом Новгороде',
    primary: 'Описать текущий ПК',
    primaryHref: contacts.vk,
    secondary: 'Посмотреть сборки',
    secondaryHref: '/#catalog',
  },
} as const;

const localBenefits = [
  {
    title: 'Самовывоз в городе',
    text: 'Основная выдача — Великий Новгород, Парковая 14к6. Перед приездом лучше уточнить наличие и готовность сборки.',
  },
  {
    title: 'Подбор под монитор и игры',
    text: 'Смотрим не только на бюджет, но и на разрешение, частоту монитора, любимые игры и задачи вроде стрима или монтажа.',
  },
  {
    title: 'Проверка перед выдачей',
    text: 'После сборки проверяем стабильность, температуру, шум, драйверы и базовую готовность компьютера к работе.',
  },
];

const searchIntents = [
  'купить игровой ПК в Великом Новгороде',
  'сборка компьютера на заказ',
  'готовые игровые компьютеры в наличии',
  'ПК для Full HD, 2K и 4K',
  'апгрейд и подбор комплектующих',
  'доставка ПК по Новгородской области и России',
];

export function LocalSeoPage({ variant }: LocalSeoPageProps) {
  const copy = pageCopy[variant];

  return (
    <main className="localSeoPage">
      <section className="localHero">
        <div className="container localHeroGrid">
          <div className="localHeroCopy">
            <span className="badge">{copy.badge}</span>
            <h1>{copy.title}</h1>
            <p>{copy.text}</p>
            <div className="localHeroActions">
              <a className="button buttonPrimary" href={copy.primaryHref}>
                {copy.primary}
              </a>
              <a className="button buttonSecondary" href={copy.secondaryHref} target={copy.secondaryHref.startsWith('http') ? '_blank' : undefined} rel={copy.secondaryHref.startsWith('http') ? 'noreferrer' : undefined}>
                {copy.secondary}
              </a>
            </div>
          </div>
          <div className="localHeroMedia">
            <img src={copy.image} alt={copy.imageAlt} />
          </div>
        </div>
      </section>

      <section className="section localSeoContent" aria-labelledby="local-seo-title">
        <div className="container localSeoLayout">
          <div>
            <h2 id="local-seo-title">Компьютер под задачу, а не просто набор деталей</h2>
            <p>
              Для заказа игрового ПК в Великом Новгороде важно понимать, что вы покупаете не просто комплектующие, а готовый к победам инструмент. Будь то недорогая сборка для киберспорта (CS2, Dota 2, Valorant), мощный компьютер под современные игры в 2K/4K на ультра настройках или тихая рабочая станция для стриминга и монтажа видео — мы подберем идеальный баланс цены и FPS.
            </p>
            {variant === 'upgrade' ? (
              <p>
                Для профессионального апгрейда лучше прислать текущую конфигурацию, фото корпуса и блока питания, задачи и желаемый бюджет. Так мы сможем точно определить узкое место (bottleneck) системы и подсказать, где достаточно установить мощную видеокарту или добавить SSD M.2, а где выгоднее собрать новый компьютер с заделом на будущее.
              </p>
            ) : (
              <p>
                Если нужной конфигурации с RTX или Ryzen нет в наличии, мы быстро соберем кастомный ПК под ваш бюджет. Покупателям из Великого Новгорода доступен удобный самовывоз с тестированием прямо на месте. Доставка по Новгородской области и в другие регионы России с надежной упаковкой обсуждается индивидуально.
              </p>
            )}
          </div>
          <aside className="localIntentPanel" aria-label="Популярные запросы">
            {searchIntents.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </aside>
        </div>
      </section>

      <section className="section localBenefitsSection" aria-labelledby="local-benefits-title">
        <div className="container">
          <div className="sectionHeader">
            <span className="badge">Локально</span>
            <h2 id="local-benefits-title" className="sectionTitle">Почему это удобно в Великом Новгороде</h2>
          </div>
          <div className="localBenefitsGrid">
            {localBenefits.map((item) => (
              <article className="localBenefit" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

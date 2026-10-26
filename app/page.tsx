import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckSquare,
  ChevronRight,
  Crosshair,
  Layers3,
  Shield,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { WorkspacePreview } from "@/components/landing/WorkspacePreview";
import styles from "./landing.module.css";

const features = [
  {
    icon: CalendarDays,
    number: "01",
    title: "Один календарь. Общий ритм.",
    description:
      "Тренировки, матчи и встречи в одном расписании. Планируйте неделю и замечайте пересечения заранее.",
    href: "/calendar",
    link: "Посмотреть календарь",
    className: "calendar",
  },
  {
    icon: CheckSquare,
    number: "02",
    title: "Каждый знает свой следующий шаг.",
    description:
      "Соберите задачи на доске, назначьте ответственных и отслеживайте путь от идеи до результата.",
    href: "/tasks",
    link: "Открыть задачи",
    className: "tasks",
  },
  {
    icon: Sparkles,
    number: "03",
    title: "Есть вопрос? Разберём вместе.",
    description:
      "Обсудите с ИИ-помощником тренировочный план, тактику или подготовку к турниру. Решения остаются за командой.",
    href: "/ai",
    link: "Познакомиться с помощником",
    className: "assistant",
  },
];

export default function Home() {
  return (
    <div className={styles.landing}>
      <a href="#main" className={styles.skipLink}>
        Перейти к содержимому
      </a>
      <header className={styles.header}>
        <nav className={styles.nav} aria-label="Навигация главной страницы">
          <Link className={styles.logo} href="/" aria-label="BYTEAM — главная">
            <span className={styles.logoMark}>B</span>
            <span>BYTEAM</span>
            <small>БЕТА</small>
          </Link>
          <div className={styles.navLinks}>
            <a href="#features">Возможности</a>
            <a href="#workflow">Как это работает</a>
            <Link href="/ai">
              ИИ-помощник
              <Sparkles size={12} />
            </Link>
          </div>
          <div className={styles.navActions}>
            <Link href="/login" className={styles.loginLink}>
              Войти
            </Link>
            <Link href="/register" className={styles.navCta}>
              Начать
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </nav>
      </header>
      <main id="main">
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroCopy}>
            <div className={styles.kicker}>
              <i />
              ПРОСТРАНСТВО ДЛЯ ТЕХ, КТО ИГРАЕТ ВМЕСТЕ.
            </div>
            <h1 id="hero-title" lang="en" aria-label="Build your team.">
              Build your
              <br />
              <span>team.</span>
              <ArrowUpRight
                className={styles.heroPeriod}
                aria-hidden="true"
                strokeWidth={1.3}
              />
            </h1>
            <p className={styles.sloganTranslation}>Собери свою команду.</p>
            <p className={styles.heroDescription}>
              Меньше переписок — больше игры. Соберите состав, тренировки и
              задачи в одном пространстве. Дальше — только вместе.
            </p>
            <div className={styles.heroActions}>
              <Link href="/register" className={styles.cta}>
                Создать команду
                <ArrowUpRight size={19} />
              </Link>
              <Link href="/calendar" className={styles.explore}>
                Посмотреть интерфейс
                <ArrowRight size={17} />
              </Link>
            </div>
            <div className={styles.heroNote}>
              <span>
                <Check size={14} />
                Создано для CS2
              </span>
              <i />
              <span>От капитана до каждого игрока</span>
            </div>
          </div>
          <WorkspacePreview />
        </section>
        <div className={styles.toolStrip}>
          <span className={styles.stripCaption}>
            ВСЯ КОМАНДА.
            <br />
            ОДНО ПРОСТРАНСТВО.
          </span>
          {[
            { icon: Users, text: "Состав" },
            { icon: CalendarDays, text: "Расписание" },
            { icon: Crosshair, text: "Тренировки" },
            { icon: Trophy, text: "Турниры" },
            { icon: Sparkles, text: "ИИ-помощник" },
          ].map(({ icon: Icon, text }) => (
            <span key={text} className={styles.stripItem}>
              <Icon size={19} />
              {text}
            </span>
          ))}
          <span className={styles.stripEnd}>
            <Layers3 size={28} />
          </span>
        </div>
        <section
          className={styles.features}
          id="features"
          aria-labelledby="features-title"
        >
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionLabel}>
                ПОРЯДОК ВНЕ СЕРВЕРА. УВЕРЕННОСТЬ В ИГРЕ.
              </span>
              <h2 id="features-title">
                Уберите хаос.
                <br />
                Оставьте командную работу.
              </h2>
            </div>
            <p>
              Когда план понятен каждому, можно сосредоточиться на главном: на
              игре, развитии и людях рядом.
            </p>
          </div>
          <div className={styles.featureGrid}>
            {features.map(({ icon: Icon, ...feature }) => (
              <article
                key={feature.number}
                className={`${styles.feature} ${styles[feature.className]}`}
              >
                <div className={styles.featureTop}>
                  <span className={styles.featureIcon}>
                    <Icon size={24} />
                  </span>
                  <span>{feature.number} /</span>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <Link href={feature.href}>
                  {feature.link}
                  <ArrowUpRight size={17} />
                </Link>
              </article>
            ))}
          </div>
        </section>
        <section
          className={styles.workflow}
          id="workflow"
          aria-labelledby="workflow-title"
        >
          <div className={styles.workflowIntro}>
            <span className={styles.sectionLabel}>
              НАЧАТЬ ПРОЩЕ, ЧЕМ КАЖЕТСЯ
            </span>
            <h2 id="workflow-title">
              От «когда играем?»
              <br />к общему плану.
            </h2>
            <Link href="/register">
              Собрать свою команду
              <ArrowRight size={17} />
            </Link>
          </div>
          <ol>
            {[
              {
                title: "Создайте пространство",
                text: "Зарегистрируйтесь, создайте команду и добавьте игроков в состав.",
              },
              {
                title: "Задайте ритм",
                text: "Запланируйте тренировки, распределите задачи и определите цель на неделю.",
              },
              {
                title: "Играйте и развивайтесь",
                text: "Разбирайте результаты, обновляйте план и готовьтесь к следующему матчу.",
              },
            ].map((step, i) => (
              <li key={step.title}>
                <span>0{i + 1}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <section className={styles.finalCta} aria-labelledby="cta-title">
          <div className={styles.ctaSymbol} aria-hidden="true">
            <Shield size={60} />
            <span>ВМЕСТЕ — СИЛЬНЕЕ</span>
          </div>
          <div>
            <span className={styles.sectionLabel}>
              СЛЕДУЮЩАЯ ГЛАВА ВАШЕЙ КОМАНДЫ
            </span>
            <h2 id="cta-title">
              Хорошая игра начинается
              <br />с хорошей организации.
            </h2>
          </div>
          <Link className={styles.cta} href="/register">
            Начать в BYTEAM
            <ChevronRight size={18} />
          </Link>
        </section>
      </main>
      <footer className={styles.footer}>
        <Link href="/" className={styles.footerBrand}>
          <span className={styles.logoMark}>B</span>BYTEAM
        </Link>
        <span>Для тех, кто играет командой.</span>
        <div>
          <Link href="/login">Войти</Link>
          <a href="#features">Возможности</a>
          <span>© {new Date().getFullYear()} BYTEAM</span>
        </div>
      </footer>
    </div>
  );
}

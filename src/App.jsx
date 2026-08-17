import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bike,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Menu,
  Phone,
  Play,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  UtensilsCrossed,
  X,
  Zap,
} from 'lucide-react'
import {
  blogPosts,
  galleryImages,
  menuFilters,
  menuItems,
  promoCards,
  testimonials,
  trendingItems,
} from './data'
import { useCart } from './commerce/index.js'
import { HomeDropdown } from './commerce/CommercePages.jsx'

gsap.registerPlugin(ScrollTrigger)

const navLinks = [
  ['Home', 'home'],
  ['About Us', 'about'],
  ['Menu', 'menu'],
  ['Gallery', 'gallery'],
  ['News', 'news'],
  ['Contact', 'contact'],
]

function Logo({ light = false }) {
  return (
    <a className={`logo ${light ? 'logo--light' : ''}`} href="#home" aria-label="TasteNest home">
      <span className="logo__crest"><UtensilsCrossed size={14} strokeWidth={2.5} /></span>
      <span className="logo__word">Taste<span>Nest</span></span>
      <small>good mood food</small>
    </a>
  )
}

function ActionButton({ children, className = '', onClick, href, type = 'button', icon = true }) {
  const content = (
    <>
      <span>{children}</span>
      {icon && <ArrowUpRight size={16} aria-hidden="true" />}
    </>
  )

  if (href) {
    return (
      <a className={`button magnetic ${className}`} href={href}>
        {content}
      </a>
    )
  }

  return (
    <button className={`button magnetic ${className}`} onClick={onClick} type={type}>
      {content}
    </button>
  )
}

function SectionHeading({ eyebrow, title, accent, align = 'center', description }) {
  const parts = accent ? title.split(accent) : [title]
  return (
    <header className={`section-heading section-heading--${align}`} data-reveal>
      <span className="eyebrow"><span />{eyebrow}</span>
      <h2>
        {parts[0]}
        {accent && <em>{accent}</em>}
        {parts[1]}
      </h2>
      {description && <p>{description}</p>}
    </header>
  )
}

function TiltCard({ className = '', children }) {
  const onMove = (event) => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    const card = event.currentTarget
    const bounds = card.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width - 0.5
    const y = (event.clientY - bounds.top) / bounds.height - 0.5
    card.style.setProperty('--tilt-x', `${y * -9}deg`)
    card.style.setProperty('--tilt-y', `${x * 11}deg`)
    card.style.setProperty('--glow-x', `${(x + 0.5) * 100}%`)
    card.style.setProperty('--glow-y', `${(y + 0.5) * 100}%`)
  }

  const onLeave = (event) => {
    event.currentTarget.style.setProperty('--tilt-x', '0deg')
    event.currentTarget.style.setProperty('--tilt-y', '0deg')
  }

  return (
    <div className={`tilt-card ${className}`} onPointerMove={onMove} onPointerLeave={onLeave}>
      {children}
    </div>
  )
}

function DeliveryIllustration() {
  return (
    <div className="delivery-art" aria-hidden="true">
      <span className="delivery-art__trail trail-one" />
      <span className="delivery-art__trail trail-two" />
      <span className="delivery-art__box">HOT<br />FOOD</span>
      <Bike className="delivery-art__bike" strokeWidth={1.55} />
      <span className="delivery-art__wheel wheel-one" />
      <span className="delivery-art__wheel wheel-two" />
    </div>
  )
}

const commerceAliases = {
  'Chef’s collection': 'h4-fast-food-combo',
  'Delicious & Hot Pizza': 'h4-chicago-deep-pizza',
  'French Fry': 'h4-fast-food-combo',
  'Chicken & French Fry': 'h4-fast-food-combo',
  'Express delivery': 'h4-fast-food-combo',
  'Chef’s table': 'main-menu-smoky-beef-burger',
  'Chicago Deep Pizza': 'main-menu-chicago-deep-pizza',
  'Chicago Burger King': 'h4-whopper-burger',
  'Chicago Chicken Wings': 'chicken-crunch',
  'Chicago French Fries': 'h4-fast-food-combo',
  'Chicago Deep Pasta': 'h4-chinese-pasta',
  'Chicago Beef Jerky': 'smoky-beef-burger',
  'Chicago Salad Recipes': 'main-menu-garden-street-tacos',
}

const homeFiveProductId = (item) => `main-menu-${item.name}`

function App({ onNavigate, onOpenCart }) {
  const pageRef = useRef(null)
  const heroVantaRef = useRef(null)
  const galleryRef = useRef(null)
  const cursorRef = useRef(null)
  const cursorRingRef = useRef(null)
  const toastTimerRef = useRef(null)
  const [loaded, setLoaded] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuFilter, setMenuFilter] = useState('Chicken Fry')
  const [testimonial, setTestimonial] = useState(0)
  const [activeProcess, setActiveProcess] = useState(1)
  const [videoOpen, setVideoOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const { itemCount, addItem } = useCart()

  const visibleMenu = useMemo(
    () => menuItems.filter((item) => item.category === menuFilter),
    [menuFilter],
  )

  const showToast = (message) => {
    window.clearTimeout(toastTimerRef.current)
    setToast(message)
    toastTimerRef.current = window.setTimeout(() => setToast(''), 2600)
  }

  const addToOrder = (reference = 'h4-fast-food-combo', label = typeof reference === 'string' ? reference : reference.name) => {
    const productId = typeof reference === 'string' ? commerceAliases[reference] ?? reference : reference
    if (!addItem(productId)) {
      showToast('That dish is unavailable right now')
      return
    }
    showToast(`${label} added to your order`)
  }

  useEffect(() => {
    let active = true
    Promise.all([
      document.fonts?.ready ?? Promise.resolve(),
      new Promise((resolve) => window.setTimeout(resolve, 1450)),
    ]).then(() => active && setLoaded(true))
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return undefined

    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.9,
      anchors: true,
    })
    const raf = (time) => lenis.raf(time * 1000)
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
    }
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('is-locked', !loaded || menuOpen || videoOpen)
    return () => document.body.classList.remove('is-locked')
  }, [loaded, menuOpen, videoOpen])

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion || !heroVantaRef.current) return undefined

    let cancelled = false
    let effect
    heroVantaRef.current.dataset.effect = 'loading'
    Promise.all([import('three'), import('vanta/dist/vanta.fog.min')]).then(([THREE, vantaModule]) => {
      const createFog = vantaModule.default?.default ?? vantaModule.default
      if (cancelled || !heroVantaRef.current) return
      if (typeof createFog !== 'function') {
        heroVantaRef.current.dataset.effect = 'unavailable'
        return
      }
      effect = createFog({
        el: heroVantaRef.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 500,
        minWidth: 320,
        highlightColor: 0xf41f4a,
        midtoneColor: 0x371018,
        lowlightColor: 0x09090b,
        baseColor: 0x09090b,
        blurFactor: 0.48,
        speed: 0.75,
        zoom: 0.72,
      })
      heroVantaRef.current.dataset.effect = 'ready'
    }).catch(() => {
      if (heroVantaRef.current) heroVantaRef.current.dataset.effect = 'fallback'
    })

    return () => {
      cancelled = true
      effect?.destroy()
    }
  }, [])

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarse = window.matchMedia('(pointer: coarse)').matches
    if (reduceMotion || coarse || !cursorRef.current || !cursorRingRef.current) return undefined

    const dotX = gsap.quickTo(cursorRef.current, 'x', { duration: 0.12, ease: 'power3.out' })
    const dotY = gsap.quickTo(cursorRef.current, 'y', { duration: 0.12, ease: 'power3.out' })
    const ringX = gsap.quickTo(cursorRingRef.current, 'x', { duration: 0.45, ease: 'power3.out' })
    const ringY = gsap.quickTo(cursorRingRef.current, 'y', { duration: 0.45, ease: 'power3.out' })
    const onPointerMove = (event) => {
      dotX(event.clientX)
      dotY(event.clientY)
      ringX(event.clientX)
      ringY(event.clientY)
    }
    window.addEventListener('pointermove', onPointerMove)
    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const interval = window.setInterval(
      () => setTestimonial((current) => (current + 1) % testimonials.length),
      7000,
    )
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        setVideoOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useLayoutEffect(() => {
    if (!loaded || !pageRef.current) return undefined
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return undefined

    const context = gsap.context(() => {
      const intro = gsap.timeline({ defaults: { ease: 'power4.out' } })
      intro
        .from('.hero__eyebrow', { y: 28, opacity: 0, duration: 0.75 })
        .from('.hero__title-line', { yPercent: 110, rotate: 2, duration: 0.85, stagger: 0.09 }, '-=0.45')
        .from('.hero__copy, .hero__actions, .hero__subscribe', { y: 24, opacity: 0, duration: 0.7, stagger: 0.1 }, '-=0.45')
        .from('.hero__discount', { scale: 0, rotate: -20, duration: 0.8, ease: 'back.out(1.7)' }, '-=0.7')
        .from('.hero__food-frame', { x: 80, opacity: 0, scale: 0.9, duration: 1.05 }, '-=0.9')

      gsap.utils.toArray('[data-reveal]').forEach((element) => {
        gsap.fromTo(
          element,
          { y: 56, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: element, start: 'top 88%', once: true },
          },
        )
      })

      gsap.utils.toArray('[data-parallax]').forEach((element) => {
        gsap.fromTo(
          element,
          { yPercent: -7 },
          {
            yPercent: 7,
            ease: 'none',
            scrollTrigger: { trigger: element, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
      })

      gsap.utils.toArray('[data-count]').forEach((element) => {
        const counter = { value: 0 }
        gsap.to(counter, {
          value: Number(element.dataset.count),
          duration: 1.7,
          ease: 'power2.out',
          scrollTrigger: { trigger: element, start: 'top 88%', once: true },
          onUpdate: () => {
            element.textContent = `${Math.round(counter.value)}+`
          },
        })
      })

      gsap.to('.scroll-progress__bar', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: 0.15 },
      })

      gsap.utils.toArray('.magnetic').forEach((button) => {
        const move = (event) => {
          const bounds = button.getBoundingClientRect()
          gsap.to(button, {
            x: (event.clientX - bounds.left - bounds.width / 2) * 0.15,
            y: (event.clientY - bounds.top - bounds.height / 2) * 0.15,
            duration: 0.3,
          })
        }
        const leave = () => gsap.to(button, { x: 0, y: 0, duration: 0.65, ease: 'elastic.out(1, .35)' })
        button.addEventListener('pointermove', move)
        button.addEventListener('pointerleave', leave)
      })
    }, pageRef)

    return () => context.revert()
  }, [loaded])

  const submitSubscribe = (event) => {
    event.preventDefault()
    event.currentTarget.reset()
    showToast('Welcome to the TasteNest table!')
  }

  const scrollGallery = (direction) => {
    galleryRef.current?.scrollBy({
      left: direction * galleryRef.current.clientWidth * 0.72,
      behavior: 'smooth',
    })
  }

  return (
    <div ref={pageRef} className="site-shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="cursor-dot" ref={cursorRef} />
      <div className="cursor-ring" ref={cursorRingRef} />
      <div className="scroll-progress"><span className="scroll-progress__bar" /></div>

      <div className={`loader ${loaded ? 'loader--done' : ''}`} aria-hidden={loaded}>
        <div className="loader__mark"><UtensilsCrossed size={34} /></div>
        <div className="loader__name">Taste<span>Nest</span></div>
        <div className="loader__track"><span /></div>
        <p>Preparing something delicious</p>
      </div>

      <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
        <div className="header__inner container">
          <Logo />
          <nav className="desktop-nav" aria-label="Primary navigation">
            {navLinks.map(([label, id]) => {
              if (label === 'Home') return <HomeDropdown key={id} className="tn-home-menu--home-five" onNavigate={onNavigate} />
              if (label === 'Menu') return <a href="/menu" key={id} onClick={(event) => { event.preventDefault(); onNavigate?.('/menu') }}>Explore food</a>
              return <a href={`#${id}`} key={id}>{label}</a>
            })}
          </nav>
          <div className="header__actions">
            <button className="icon-button header__search" aria-label="Explore food" onClick={() => onNavigate?.('/menu')}>
              <Search size={18} />
            </button>
            <button className="cart-button" aria-label={`Open order, ${itemCount} items`} onClick={onOpenCart}>
              <ShoppingBag size={18} />
              <span>{itemCount}</span>
            </button>
            <a className="header__contact magnetic" href="#contact">Contact Us <ArrowUpRight size={15} /></a>
            <button className="menu-button" aria-label="Open menu" onClick={() => setMenuOpen(true)}><Menu /></button>
          </div>
        </div>
      </header>

      <aside className={`mobile-menu ${menuOpen ? 'mobile-menu--open' : ''}`} aria-hidden={!menuOpen}>
        <button className="mobile-menu__close" aria-label="Close menu" onClick={() => setMenuOpen(false)}><X /></button>
        <Logo light />
        <nav aria-label="Mobile navigation">
          <HomeDropdown
            className="tn-home-menu--home-five-mobile"
            label="Choose Home"
            onNavigate={(target) => {
              setMenuOpen(false)
              onNavigate?.(target)
            }}
          />
          {navLinks.filter(([label]) => label !== 'Home').map(([label, id], index) => (
            <a
              href={label === 'Menu' ? '/menu' : `#${id}`}
              key={id}
              onClick={(event) => {
                setMenuOpen(false)
                if (label === 'Menu') {
                  event.preventDefault()
                  onNavigate?.('/menu')
                }
              }}
            >
              <span>0{index + 2}</span>{label}<ArrowRight size={20} />
            </a>
          ))}
        </nav>
        <div className="mobile-menu__meta"><Phone size={17} /> +1 718 904 4450</div>
      </aside>

      {menuOpen && <button className="screen-overlay" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}

      <main id="main">
        <section className="hero" id="home">
          <div className="hero__vanta" ref={heroVantaRef} />
          <div className="hero__grain" />
          <div className="hero__food-frame">
            <img src="/assets/hero-ingredients.webp" alt="A vibrant table of fresh ingredients" fetchPriority="high" decoding="async" />
          </div>
          <div className="hero__inner container">
            <div className="hero__content">
              <span className="hero__eyebrow">Starting at <strong>$24.00</strong></span>
              <h1>
                <span className="hero__title-mask"><span className="hero__title-line">The best Food</span></span>
                <span className="hero__title-mask"><span className="hero__title-line">Collection <em>2024</em></span></span>
              </h1>
              <p className="hero__copy">Exclusive offer — <strong>35% off</strong> this week. Big flavour, crisp edges and proper comfort food.</p>
              <div className="hero__actions">
                <ActionButton onClick={() => addToOrder('Chef’s collection')}>Order Now</ActionButton>
                <a className="hero__ghost-link" href="/menu" onClick={(event) => { event.preventDefault(); onNavigate?.('/menu') }}><span>Explore menu</span><ArrowRight size={18} /></a>
              </div>
              <form className="hero__subscribe" onSubmit={submitSubscribe}>
                <input type="email" placeholder="Your email address" aria-label="Email address" required />
                <button type="submit">Subscribe</button>
              </form>
            </div>
            <div className="hero__discount" aria-label="Up to 20 percent discount">
              <small>Up to</small><strong>20%</strong><span>discount</span>
            </div>
            <div className="hero__spice spice-one" aria-hidden="true">✦</div>
            <div className="hero__spice spice-two" aria-hidden="true">●</div>
          </div>
          <div className="hero__scroll"><span>Scroll to taste</span><i /></div>
        </section>

        <section className="promo-section">
          <div className="promo-grid container">
            {promoCards.map((card, index) => (
              <TiltCard className={`promo-card promo-card--${card.tone}`} key={card.title}>
                <img src={card.image} alt="" data-parallax loading="lazy" decoding="async" />
                <div className="promo-card__shade" />
                <div className="promo-card__content">
                  <span>{card.eyebrow}</span>
                  <h3>{card.title}</h3>
                  {index === 1 && <small>This weekend only</small>}
                  <button onClick={() => addToOrder(card.title)}>Order now <ArrowRight size={15} /></button>
                </div>
                <span className="promo-card__number">0{index + 1}</span>
              </TiltCard>
            ))}
          </div>
        </section>

        <section className="about section-pad" id="about">
          <div className="about__inner container">
            <div className="about__media" data-reveal>
              <div className="about__image-wrap image-hover">
                <img src="/assets/cheese-pizza.webp" alt="Freshly baked artisan pizza" data-parallax loading="lazy" decoding="async" />
                <div className="about__image-label">We cook<br /><strong>hot & fresh</strong><br />for you</div>
              </div>
              <div className="about__stamp"><span>Since</span><strong>1985</strong></div>
            </div>
            <div className="about__content">
              <SectionHeading
                eyebrow="About our food"
                title="The Best Delicious Food Made From Us..."
                accent="Delicious"
                align="left"
                description="Every dish starts with honest ingredients, lively seasoning and a kitchen team obsessed with serving it at its absolute best."
              />
              <div className="about__stats" data-reveal>
                <div><span>O</span><strong data-count="250">0+</strong><small>Satisfied clients</small></div>
                <div><span>F</span><strong data-count="153">0+</strong><small>Food categories</small></div>
                <div><span>A</span><strong data-count="25">0+</strong><small>Awards won</small></div>
              </div>
              <div className="about__signature" data-reveal>
                <div className="signature-line">Tastenest</div>
                <span>Foundation, since 21 Oct, 2019</span>
              </div>
            </div>
          </div>
        </section>

        <section className="menu-showcase section-pad" id="menu">
          <div className="container">
            <SectionHeading eyebrow="About our food" title="Hot Delicious Item" accent="Delicious" />
            <div className="menu-tabs" role="tablist" aria-label="Menu filters" data-reveal>
              {menuFilters.map((filter) => (
                <button
                  className={menuFilter === filter ? 'is-active' : ''}
                  key={filter}
                  onClick={() => setMenuFilter(filter)}
                  role="tab"
                  aria-selected={menuFilter === filter}
                >
                  {filter}
                </button>
              ))}
            </div>
            <div className="menu-grid" key={menuFilter}>
              {visibleMenu.map((item) => {
                const productId = homeFiveProductId(item)
                const productPath = `/product/${encodeURIComponent(productId)}`
                return (
                  <article className="menu-card" key={item.name} data-reveal>
                    <button className="menu-card__heart" aria-label={`Save ${item.name}`} onClick={() => showToast(`${item.name} saved to favourites`)}><Heart size={17} /></button>
                    <div className="menu-card__image"><button className="menu-card__detail" type="button" aria-label={`View ${item.name} details`} onClick={() => onNavigate?.(productPath)}><img src={item.image} alt={item.name} loading="lazy" decoding="async" /></button></div>
                    <span className="menu-card__category">{item.category}</span>
                    <h3><button className="menu-card__title" type="button" onClick={() => onNavigate?.(productPath)}>{item.name}</button></h3>
                    <p>Freshly prepared, perfectly seasoned and served hot.</p>
                    <div className="menu-card__footer">
                      <strong>${item.price}.00</strong>
                      <button aria-label={`Add ${item.name} to order`} onClick={() => addToOrder(productId, item.name)}><Plus size={18} /></button>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="video-banner" aria-label="TasteNest kitchen film">
          <img src="/assets/food-table.webp" alt="Chef’s table spread" data-parallax loading="lazy" decoding="async" />
          <div className="video-banner__shade" />
          <div className="video-banner__content" data-reveal>
            <span>Inside the TasteNest kitchen</span>
            <button aria-label="Play kitchen film" onClick={() => setVideoOpen(true)}><Play fill="currentColor" /></button>
            <p>See where the flavour starts</p>
          </div>
        </section>

        <section className="delivery-banner">
          <div className="delivery-banner__inner container">
            <div data-reveal>
              <span>Crispy, every bite tastes</span>
              <h2>30 Minutes Fast<br /><em>Delivery Challenge</em></h2>
            </div>
            <DeliveryIllustration />
            <ActionButton className="button--light" onClick={() => addToOrder('Express delivery')}>Order Now</ActionButton>
          </div>
        </section>

        <section className="offer-grid container section-pad-sm" aria-label="Special offers">
          <article className="offer-card offer-card--large" data-reveal>
            <img src="/assets/pizza.webp" alt="Special pizza offer" loading="lazy" decoding="async" />
            <div className="offer-card__shade" />
            <div><span>Today</span><h3>Special Delicious<br />Beef & Cheese Pizza</h3><b>Save 50%</b></div>
          </article>
          <div className="offer-grid__stack">
            <article className="offer-card offer-card--red" data-reveal>
              <img src="/assets/burger.webp" alt="Burger combo" loading="lazy" decoding="async" />
              <div><span>Delicious</span><h3>Burger Combo</h3><p>Limited offer / <strong>$5</strong></p></div>
            </article>
            <article className="offer-card offer-card--yellow" data-reveal>
              <img src="/assets/fries.webp" alt="French fry meal" loading="lazy" decoding="async" />
              <div><span>Crispy every bite</span><h3>Fast Food Meal</h3></div>
            </article>
          </div>
          <div className="offer-grid__stack">
            <article className="offer-card offer-card--black" data-reveal><div><span>Every day</span><h3>Super<br />Delicious</h3><b>50% off</b></div></article>
            <article className="offer-card" data-reveal>
              <img src="/assets/wings.webp" alt="Fried chicken meal" loading="lazy" decoding="async" />
              <div><span>Delicious</span><h3>Fried Chicken</h3></div>
            </article>
          </div>
        </section>

        <section className="trending section-pad-sm">
          <div className="container">
            <SectionHeading eyebrow="About our food" title="Trending Food Menu" accent="Food" />
            <div className="trending__list" data-reveal>
              {trendingItems.map(([name, price]) => (
                <button key={name} onClick={() => addToOrder(name)}>
                  <span><strong>{name}</strong><small>Quick, delicious and made fresh to order.</small></span>
                  <i />
                  <b>{price}</b>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="gallery section-pad" id="gallery">
          <div className="gallery__header container">
            <SectionHeading eyebrow="Fresh from the kitchen" title="Popular Dishes" accent="Popular" align="left" />
            <div className="gallery__buttons">
              <button aria-label="Previous dishes" onClick={() => scrollGallery(-1)}><ArrowLeft /></button>
              <button aria-label="Next dishes" onClick={() => scrollGallery(1)}><ArrowRight /></button>
            </div>
          </div>
          <div className="gallery__track" ref={galleryRef}>
            {galleryImages.map((image, index) => (
              <a className="gallery__item" href={image} key={image} aria-label={`Open dish photograph ${index + 1}`}>
                <img src={image} alt={`TasteNest dish ${index + 1}`} loading="lazy" decoding="async" />
                <span><Plus /></span>
              </a>
            ))}
          </div>
        </section>

        <section className="quality section-pad">
          <div className="quality__inner container">
            <div className="quality__content">
              <SectionHeading
                eyebrow="About our food"
                title="Where Quality Meet Excellent Service."
                accent="Service."
                align="left"
                description="Fresh ingredients, quick service and a little theatrical flair—that is how we turn an everyday meal into a bright memory."
              />
              <div className="quality__features" data-reveal>
                <div><Star /><span><strong>Super Quality Food</strong><small>Care in every detail.</small></span></div>
                <div><Sparkles /><span><strong>Well Reputation</strong><small>Loved since 1985.</small></span></div>
              </div>
              <ActionButton href="#about">More About Us</ActionButton>
            </div>
            <TiltCard className="quality__media" data-reveal>
              <img src="/assets/burger-fries.webp" alt="TasteNest signature burgers" loading="lazy" decoding="async" />
              <span className="quality__badge">Since / 1985</span>
              <div className="quality__price"><small>From</small><strong>$4.99</strong></div>
            </TiltCard>
          </div>
        </section>

        <section className="process section-pad-sm">
          <div className="container">
            <SectionHeading eyebrow="Food processing" title="How We Serve You?" accent="Serve" />
            <div className="process__grid" data-reveal>
              {[
                ['01', 'Cooking With Care'],
                ['02', 'Quickly Delivery'],
                ['03', 'Choose Food'],
              ].map(([number, title], index) => (
                <button
                  className={activeProcess === index ? 'is-active' : ''}
                  key={title}
                  onPointerEnter={() => setActiveProcess(index)}
                  onFocus={() => setActiveProcess(index)}
                >
                  <span>{number}</span>
                  {index === 0 ? <UtensilsCrossed /> : index === 1 ? <Bike /> : <Check />}
                  <h3>{title}</h3><p>Quick, thoughtful service from our kitchen to your table.</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="testimonial section-pad">
          <div className="testimonial__inner container">
            <div className="testimonial__portrait" data-reveal>
              <img src="/assets/chef.webp" alt="TasteNest chef plating a dish" loading="lazy" decoding="async" />
              <span>Feedback</span>
            </div>
            <div className="testimonial__content" data-reveal>
              <div className="testimonial__stars" aria-label="Five out of five stars">{Array.from({ length: 5 }, (_, i) => <Star key={i} fill="currentColor" />)}</div>
              <p>“{testimonials[testimonial].quote}”</p>
              <h3>{testimonials[testimonial].name}</h3>
              <span>{testimonials[testimonial].role}</span>
              <div className="testimonial__controls">
                <button aria-label="Previous testimonial" onClick={() => setTestimonial((testimonial - 1 + testimonials.length) % testimonials.length)}><ChevronLeft /></button>
                <div>{testimonials.map((item, index) => <button className={index === testimonial ? 'is-active' : ''} aria-label={`Show testimonial from ${item.name}`} key={item.name} onClick={() => setTestimonial(index)} />)}</div>
                <button aria-label="Next testimonial" onClick={() => setTestimonial((testimonial + 1) % testimonials.length)}><ChevronRight /></button>
              </div>
            </div>
          </div>
        </section>

        <section className="news section-pad" id="news">
          <div className="container">
            <SectionHeading eyebrow="News & blog" title="Update News & Blog" accent="News" />
            <div className="news__grid">
              {blogPosts.map((post) => (
                <article className="news-card" data-reveal key={post.title}>
                  <div className="news-card__image image-hover"><img src={post.image} alt="" loading="lazy" decoding="async" /><span>{post.tag}</span></div>
                  <div className="news-card__meta"><time>15 Feb 2024</time><span>Comments (0)</span></div>
                  <h3>{post.title}</h3>
                  <p>Fresh stories, kitchen notes and the flavours inspiring our newest plates.</p>
                  <a href="#news">Read more <ArrowRight size={16} /></a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="instagram-strip" aria-label="TasteNest on Instagram">
          {galleryImages.map((image, index) => (
            <a href="#contact" key={`${image}-${index}`}>
              <img src={image} alt="" loading="lazy" decoding="async" />
              <span><Camera />@tastenest</span>
            </a>
          ))}
        </section>
      </main>

      <footer className="footer" id="contact">
        <div className="footer__top container">
          <div className="footer__brand" data-reveal>
            <Logo light />
            <p>Tuesday – Saturday: 12:00pm – 11:00pm<br />Closed on Sunday</p>
            <span><Star fill="currentColor" /> 5-star rated on TripAdvisor</span>
          </div>
          <div className="footer__links" data-reveal><h3>About</h3><a href="#menu">Food & Drink</a><a href="#about">Special Dish</a><a href="#contact">Reservation</a><a href="#contact">Contact</a></div>
          <div className="footer__links" data-reveal><h3>Menu</h3><a href="#menu">Steaks</a><a href="#menu">Burgers</a><a href="#menu">Cocktails</a><a href="#menu">Desserts</a></div>
          <div className="footer__newsletter" data-reveal>
            <h3>Newsletter</h3><p>Get recent news and updates.</p>
            <form onSubmit={submitSubscribe}><input type="email" placeholder="Email address" aria-label="Footer email address" required /><button type="submit">Subscribe</button></form>
          </div>
        </div>
        <div className="footer__bottom container"><span>© 2026 TasteNest. All rights reserved.</span><div><a href="#home">Facebook</a><a href="#home">Instagram</a></div></div>
        <div className="footer__scribble" aria-hidden="true">🍕</div>
      </footer>

      <button className={`back-to-top ${scrolled ? 'back-to-top--show' : ''}`} aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><ArrowUpRight /></button>
      <div className={`toast ${toast ? 'toast--show' : ''}`} role="status"><Check />{toast}</div>

      {videoOpen && (
        <div className="video-modal" role="dialog" aria-modal="true" aria-label="TasteNest kitchen film">
          <button className="video-modal__close" onClick={() => setVideoOpen(false)} aria-label="Close film"><X /></button>
          <div className="video-modal__card">
            <img src="/assets/food-table.webp" alt="A table full of TasteNest dishes" loading="lazy" decoding="async" />
            <div><span><Zap /> Fresh from the pass</span><h2>Flavour is a team sport.</h2><p>Every plate moves through prep, fire and finish with one goal: serve it bright, hot and generous.</p><ActionButton onClick={() => { setVideoOpen(false); addToOrder('Chef’s table') }}>Taste the menu</ActionButton></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

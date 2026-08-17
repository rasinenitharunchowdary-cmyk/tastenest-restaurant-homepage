import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Coffee,
  Heart,
  LockKeyhole,
  MapPin,
  Menu,
  Play,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  UtensilsCrossed,
  X,
} from 'lucide-react'
import {
  products,
  screenDefinitions,
  screenOrder,
} from './screenData'
import { useCart } from '../commerce/index.js'
import { HomeDropdown } from '../commerce/CommercePages.jsx'

gsap.registerPlugin(ScrollTrigger)

const productById = new Map(products.map((product) => [product.id, product]))

function themeStyle(theme) {
  return {
    '--fs-accent': theme.accent,
    '--fs-accent-2': theme.accent2,
    '--fs-surface': theme.surface,
    '--fs-ink': theme.ink,
    '--fs-hero': theme.hero,
    '--fs-hero-text': theme.heroText,
    '--fs-card': theme.card,
  }
}

function ScreenLink({ href, onNavigate, children, className = '', onClick, ...props }) {
  const handleClick = (event) => {
    onClick?.(event)
    if (event.defaultPrevented || !onNavigate || !href?.startsWith('/')) return
    event.preventDefault()
    onNavigate(href)
  }

  return (
    <a className={className} href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  )
}

function ScreenBrand({ config, onNavigate }) {
  return (
    <ScreenLink className="fs-brand" href="/designs" onNavigate={onNavigate} aria-label="Open design collection">
      <span className="fs-brand__mark"><UtensilsCrossed size={18} strokeWidth={2.5} /></span>
      <span className="fs-brand__type">
        <strong>{config.layout === 'coffee-house' ? 'TasteNest Coffee' : 'TasteNest'}</strong>
        <small>{config.layout === 'coffee-house' ? 'Coffee House' : 'Restaurant'}</small>
      </span>
    </ScreenLink>
  )
}

function SectionTitle({ eyebrow, title, copy, align = 'left' }) {
  return (
    <header className={`fs-section-title fs-section-title--${align}`}>
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
    </header>
  )
}

function ProductCard({ product, favourite, onFavourite, onAdd, onNavigate }) {
  return (
    <article className="fs-product-card">
      <div className="fs-product-card__media">
        <ScreenLink className="fs-product-card__detail-link" href={`/product/${product.id}`} onNavigate={onNavigate} aria-label={`View ${product.name}`}>
          <img src={product.image} alt={product.name} loading="lazy" decoding="async" />
        </ScreenLink>
        <span className="fs-product-card__badge">{product.badge}</span>
        <button
          className="fs-icon-button fs-product-card__heart"
          type="button"
          aria-label={`${favourite ? 'Remove' : 'Save'} ${product.name}`}
          aria-pressed={favourite}
          onClick={() => onFavourite(product.id)}
        >
          <Heart size={17} fill={favourite ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="fs-product-card__body">
        <span className="fs-product-card__category">{product.category}</span>
        <div className="fs-product-card__title-row">
          <h3><ScreenLink href={`/product/${product.id}`} onNavigate={onNavigate}>{product.name}</ScreenLink></h3>
          <span><Star size={13} fill="currentColor" />{product.rating}</span>
        </div>
        <p>{product.description}</p>
        <footer>
          <strong>${product.price}.00</strong>
          <button type="button" onClick={() => onAdd(product)}>
            <Plus size={16} /> Add
          </button>
        </footer>
      </div>
    </article>
  )
}

function HeroArtwork({ slide, layout, onPlay }) {
  return (
    <div className="fs-hero__visual">
      <span className="fs-hero__orbit fs-hero__orbit--one" aria-hidden="true" />
      <span className="fs-hero__orbit fs-hero__orbit--two" aria-hidden="true" />
      <span className="fs-hero__scribble" aria-hidden="true">fresh / hot / now</span>
      {layout === 'coffee-house' && (
        <div className="fs-coffee-cup" aria-hidden="true">
          <span className="fs-coffee-cup__steam fs-coffee-cup__steam--one" />
          <span className="fs-coffee-cup__steam fs-coffee-cup__steam--two" />
          <Coffee />
        </div>
      )}
      <div className="fs-hero__image-wrap">
        <img src={slide.image} alt={slide.alt} fetchPriority="high" decoding="async" />
      </div>
      <button className="fs-hero__play" type="button" aria-label="Open the kitchen story" onClick={onPlay}>
        <Play size={18} fill="currentColor" />
        <span>Our story</span>
      </button>
    </div>
  )
}

function ScreenHeader({ config, onNavigate, count, query, onQuery, mobileOpen, setMobileOpen, onOpenCart }) {
  const menuId = `fs-mobile-menu-${config.key}`
  const storyAnchor = `#fs-story-${config.key}`
  const visitAnchor = `#fs-visit-${config.key}`

  return (
    <>
      <div className="fs-utility">
        <span><Clock3 size={13} /> Open today 11:00–23:00</span>
        <span><MapPin size={13} /> 84 Market Street</span>
        <ScreenLink href="/designs" onNavigate={onNavigate}>View all designs <ArrowUpRight size={13} /></ScreenLink>
      </div>
      <header className="fs-header">
        <ScreenBrand config={config} onNavigate={onNavigate} />
        <nav className="fs-header__nav" aria-label={`${config.frame} primary navigation`}>
          <HomeDropdown className="fs-home-menu" onNavigate={onNavigate} />
          <ScreenLink href="/menu" onNavigate={onNavigate}>Menu</ScreenLink>
          <a href={storyAnchor}>Our story</a>
          <a href={visitAnchor}>Visit</a>
        </nav>
        <div className="fs-header__actions">
          <label className="fs-search">
            <Search size={16} aria-hidden="true" />
            <span className="fs-sr-only">Search featured dishes</span>
            <input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Search" />
          </label>
          <button
            className="fs-icon-button fs-cart-button"
            type="button"
            aria-label={`Open bag with ${count} item${count === 1 ? '' : 's'}`}
            onClick={onOpenCart}
          >
            <ShoppingBag size={18} />
            <span>{count}</span>
          </button>
          <button
            className="fs-icon-button fs-menu-button"
            type="button"
            aria-label="Open navigation"
            aria-controls={menuId}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} />
          </button>
        </div>
      </header>
      {mobileOpen && (
        <aside className="fs-mobile-menu" id={menuId} aria-label="Mobile navigation">
          <div className="fs-mobile-menu__top">
            <ScreenBrand config={config} onNavigate={onNavigate} />
            <button className="fs-icon-button" type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><X /></button>
          </div>
          <nav>
            <HomeDropdown
              className="fs-mobile-home-menu"
              label="Choose Home"
              onNavigate={(target) => {
                setMobileOpen(false)
                onNavigate?.(target)
              }}
            />
            {[
              ['Explore food', '/menu'],
              ['Our story', storyAnchor],
              ['Visit', visitAnchor],
            ].map(([label, href], index) => (
              <ScreenLink href={href} key={label} onNavigate={onNavigate} onClick={() => setMobileOpen(false)}>
                <span>0{index + 2}</span>{label}<ArrowRight />
              </ScreenLink>
            ))}
            <ScreenLink href="/designs" onNavigate={onNavigate} onClick={() => setMobileOpen(false)}>
              <span>05</span>All designs<ArrowRight />
            </ScreenLink>
          </nav>
        </aside>
      )}
    </>
  )
}

export function FigmaHomeScreen({ screenKey, onNavigate, onOpenCart }) {
  const requestedConfig = screenDefinitions[screenKey]
  const canRender = Boolean(requestedConfig?.alternate && requestedConfig?.story && requestedConfig?.featured)
  const config = canRender ? requestedConfig : screenDefinitions['home-1']
  const [heroIndex, setHeroIndex] = useState(0)
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')
  const [favourites, setFavourites] = useState(() => new Set())
  const [mobileOpen, setMobileOpen] = useState(false)
  const [storyOpen, setStoryOpen] = useState(false)
  const [testimonial, setTestimonial] = useState(0)
  const [email, setEmail] = useState('')
  const [toast, setToast] = useState('')
  const toastTimer = useRef(null)
  const screenRef = useRef(null)
  const { itemCount, addItem } = useCart()

  const featuredProducts = useMemo(
    () => config.featured.map((id) => productById.get(id)).filter(Boolean),
    [config],
  )
  const categories = useMemo(
    () => ['All', ...new Set(featuredProducts.map((product) => product.category))],
    [featuredProducts],
  )
  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return featuredProducts.filter((product) => {
      const categoryMatches = category === 'All' || product.category === category
      const queryMatches = !normalizedQuery || `${product.name} ${product.category}`.toLowerCase().includes(normalizedQuery)
      return categoryMatches && queryMatches
    })
  }, [category, featuredProducts, query])

  const slides = useMemo(() => [
    {
      eyebrow: config.eyebrow,
      title: config.title,
      lead: config.lead,
      price: config.price,
      image: config.heroImage,
      alt: config.heroAlt,
    },
    config.alternate,
  ], [config])
  const slide = slides[heroIndex]

  const showToast = (message) => {
    window.clearTimeout(toastTimer.current)
    setToast(message)
    toastTimer.current = window.setTimeout(() => setToast(''), 2400)
  }

  useEffect(() => () => window.clearTimeout(toastTimer.current), [])

  useEffect(() => {
    const onKeyDown = (event) => {
    if (event.key !== 'Escape') return
    setMobileOpen(false)
    setStoryOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    const root = screenRef.current
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      touchMultiplier: 1.25,
    })
    let animationFrame
    const raf = (time) => {
      lenis.raf(time)
      animationFrame = window.requestAnimationFrame(raf)
    }
    animationFrame = window.requestAnimationFrame(raf)
    lenis.on('scroll', ScrollTrigger.update)

    const context = gsap.context(() => {
      gsap.fromTo(
        '.fs-header, .fs-hero__copy > *',
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, stagger: 0.075, duration: 0.72, ease: 'power3.out', delay: 0.08 },
      )
      gsap.fromTo(
        '.fs-hero__visual',
        { autoAlpha: 0, scale: 0.9, rotate: -2 },
        { autoAlpha: 1, scale: 1, rotate: 0, duration: 0.9, ease: 'power3.out', delay: 0.16 },
      )

      gsap.utils.toArray('.fs-feature-rail article, .fs-product-card, .fs-story__media, .fs-story__copy, .fs-offer__image, .fs-offer__copy, .fs-testimonial__inner, .fs-visit__grid').forEach((element) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 88%',
              once: true,
            },
          },
        )
      })
    }, root)

    const visual = root.querySelector('.fs-hero__visual')
    const onPointerMove = (event) => {
      if (!visual) return
      const bounds = visual.getBoundingClientRect()
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2
      gsap.to(visual, {
        x: x * 7,
        y: y * 7,
        rotateY: x * 3,
        rotateX: y * -3,
        duration: 0.45,
        ease: 'power3.out',
        overwrite: 'auto',
      })
    }
    const onPointerLeave = () => {
      if (!visual) return
      gsap.to(visual, {
        x: 0,
        y: 0,
        rotateX: 0,
        rotateY: 0,
        duration: 0.75,
        ease: 'elastic.out(1, .48)',
        overwrite: 'auto',
      })
    }
    visual?.addEventListener('pointermove', onPointerMove)
    visual?.addEventListener('pointerleave', onPointerLeave)

    return () => {
      visual?.removeEventListener('pointermove', onPointerMove)
      visual?.removeEventListener('pointerleave', onPointerLeave)
      window.cancelAnimationFrame(animationFrame)
      lenis.destroy()
      context.revert()
    }
  }, [config.key])

  if (!canRender) return null

  const changeSlide = (direction) => {
    setHeroIndex((current) => (current + direction + slides.length) % slides.length)
  }

  const toggleFavourite = (id) => {
    setFavourites((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const addProduct = (product) => {
    if (addItem(product)) showToast(`${product.name} added to your bag`)
  }

  const addTableBundle = () => {
    const bundle = featuredProducts.slice(0, 3)
    bundle.forEach((product) => addItem(product))
    showToast(`${bundle.length} featured dishes added to your bag`)
  }

  const submitNewsletter = (event) => {
    event.preventDefault()
    showToast(`Menu notes are headed to ${email}`)
    setEmail('')
  }

  const testimonials = [
    [config.quote, config.author],
    [`${config.frame} feels considered from the first hello to the last bite. We are already planning the next table.`, 'Jordan Lee'],
  ]

  return (
    <div
      className="figma-screen"
      ref={screenRef}
      data-layout={config.layout}
      data-screen={config.key}
      style={themeStyle(config.theme)}
      id="fs-top"
    >
      <a className="fs-skip-link" href={`#fs-main-${config.key}`}>Skip to main content</a>
      <ScreenHeader
        config={config}
        onNavigate={onNavigate}
        count={itemCount}
        query={query}
        onQuery={setQuery}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onOpenCart={onOpenCart}
      />

      {mobileOpen && (
        <button
          className="fs-screen-overlay"
          type="button"
          aria-label="Close open panel"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <main id={`fs-main-${config.key}`}>
        <section className="fs-hero" aria-labelledby={`fs-hero-title-${config.key}`}>
          <div className="fs-hero__grain" aria-hidden="true" />
          <div className="fs-shell fs-hero__grid">
            <div className="fs-hero__copy">
              <span className="fs-kicker"><Sparkles size={15} />{slide.eyebrow}</span>
              <h1 id={`fs-hero-title-${config.key}`}>{slide.title}</h1>
              <p>{slide.lead}</p>
              <div className="fs-hero__price"><span>From</span><strong>{slide.price}</strong></div>
              <div className="fs-hero__actions">
                <ScreenLink className="fs-button fs-button--solid" href="/menu" onNavigate={onNavigate}>{config.primary}<ArrowUpRight /></ScreenLink>
                <a className="fs-button fs-button--ghost" href={`#fs-story-${config.key}`}>{config.secondary}<ArrowRight /></a>
              </div>
            </div>
            <HeroArtwork slide={slide} layout={config.layout} onPlay={() => setStoryOpen(true)} />
            <div className="fs-hero__controls" aria-label="Hero slides">
              <button type="button" aria-label="Previous hero slide" onClick={() => changeSlide(-1)}><ChevronLeft /></button>
              <div>
                {slides.map((item, index) => (
                  <button
                    type="button"
                    key={item.title}
                    className={index === heroIndex ? 'is-active' : ''}
                    aria-label={`Show ${item.title}`}
                    aria-current={index === heroIndex ? 'true' : undefined}
                    onClick={() => setHeroIndex(index)}
                  />
                ))}
              </div>
              <button type="button" aria-label="Next hero slide" onClick={() => changeSlide(1)}><ChevronRight /></button>
            </div>
          </div>
        </section>

        <section className="fs-feature-rail" aria-label="Service highlights">
          <div className="fs-shell">
            {config.features.map(([title, copy], index) => (
              <article key={title}>
                <span>0{index + 1}</span>
                {index === 0 ? <UtensilsCrossed /> : index === 1 ? <Sparkles /> : <Clock3 />}
                <div><h2>{title}</h2><p>{copy}</p></div>
              </article>
            ))}
          </div>
        </section>

        <section className="fs-menu-section" id={`fs-menu-${config.key}`}>
          <div className="fs-shell">
            <div className="fs-menu-section__heading">
              <SectionTitle eyebrow="Made fresh to order" title={config.featureTitle} copy="Pick a category, save a favourite and build a local demo order." />
              <div className="fs-menu-tabs" role="tablist" aria-label="Featured menu categories">
                {categories.map((item) => (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={category === item}
                    className={category === item ? 'is-active' : ''}
                    key={item}
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            {visibleProducts.length ? (
              <div className="fs-product-grid">
                {visibleProducts.map((product) => (
                  <ProductCard
                    product={product}
                    favourite={favourites.has(product.id)}
                    onFavourite={toggleFavourite}
                    onAdd={addProduct}
                    onNavigate={onNavigate}
                    key={product.id}
                  />
                ))}
              </div>
            ) : (
              <div className="fs-empty-state">
                <Search />
                <h3>No featured dishes match “{query}”</h3>
                <button type="button" onClick={() => { setQuery(''); setCategory('All') }}>Clear search</button>
              </div>
            )}
          </div>
        </section>

        <section className="fs-story" id={`fs-story-${config.key}`}>
          <div className="fs-shell fs-story__grid">
            <div className="fs-story__media">
              <img src={config.story.image} alt={config.story.alt} loading="lazy" decoding="async" />
              <span className="fs-story__seal">Made here<br />every day</span>
            </div>
            <div className="fs-story__copy">
              <SectionTitle eyebrow={config.story.eyebrow} title={config.story.title} copy={config.story.body} />
              <div className="fs-story__stats">
                {config.story.stats.map(([number, label]) => (
                  <div key={label}><strong>{number}</strong><span>{label}</span></div>
                ))}
              </div>
              <button className="fs-button fs-button--solid" type="button" onClick={() => setStoryOpen(true)}>
                Step inside <Play fill="currentColor" />
              </button>
            </div>
          </div>
        </section>

        <section className="fs-marquee" aria-label="TasteNest values">
          <div>
            <span>delicious food</span><i>✦</i><span>open flame</span><i>✦</i><span>good people</span><i>✦</i>
            <span>delicious food</span><i>✦</i><span>open flame</span><i>✦</i><span>good people</span><i>✦</i>
          </div>
        </section>

        <section className="fs-offer">
          <div className="fs-shell fs-offer__grid">
            <div className="fs-offer__image">
              <img src={config.alternate.image} alt="" loading="lazy" decoding="async" />
            </div>
            <div className="fs-offer__copy">
              <span>Local offer / this week</span>
              <h2>Bring the table. We’ll bring the flavour.</h2>
              <p>Order any three featured plates and the fourth one is on us. Available for this local concept demo.</p>
              <button className="fs-button fs-button--light" type="button" onClick={addTableBundle}>
                Add table bundle <Plus />
              </button>
            </div>
          </div>
        </section>

        <section className="fs-testimonial" aria-labelledby={`fs-testimonial-title-${config.key}`}>
          <div className="fs-shell fs-testimonial__inner">
            <span className="fs-testimonial__quote" aria-hidden="true">“</span>
            <div className="fs-testimonial__stars" aria-label="Five out of five stars">
              {Array.from({ length: 5 }, (_, index) => <Star key={index} fill="currentColor" />)}
            </div>
            <h2 id={`fs-testimonial-title-${config.key}`}>{testimonials[testimonial][0]}</h2>
            <p>{testimonials[testimonial][1]} <span>/ Local guest</span></p>
            <div className="fs-testimonial__controls">
              <button type="button" aria-label="Previous guest review" onClick={() => setTestimonial((testimonial + 1) % testimonials.length)}><ArrowLeft /></button>
              <span>{testimonial + 1} / {testimonials.length}</span>
              <button type="button" aria-label="Next guest review" onClick={() => setTestimonial((testimonial + 1) % testimonials.length)}><ArrowRight /></button>
            </div>
          </div>
        </section>

        <section className="fs-visit" id={`fs-visit-${config.key}`}>
          <div className="fs-shell fs-visit__grid">
            <div>
              <span className="fs-kicker"><MapPin size={15} />Come find us</span>
              <h2>A bright table is waiting.</h2>
              <p>84 Market Street<br />Tuesday–Sunday / 11:00–23:00</p>
            </div>
            <form className="fs-newsletter" onSubmit={submitNewsletter}>
              <label htmlFor={`fs-email-${config.key}`}>Menu notes, special drops and first table access.</label>
              <div>
                <input
                  id={`fs-email-${config.key}`}
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email address"
                />
                <button type="submit" aria-label="Join the mailing list"><ArrowUpRight /></button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer className="fs-footer">
        <div className="fs-shell fs-footer__grid">
          <ScreenBrand config={config} onNavigate={onNavigate} />
          <p>Independent food, designed with care.<br />A Figma-inspired frontend concept.</p>
          <nav aria-label="Footer navigation">
            <a href={`#fs-menu-${config.key}`}>Menu</a>
            <a href={`#fs-story-${config.key}`}>Story</a>
            <ScreenLink href="/designs" onNavigate={onNavigate}>All homes</ScreenLink>
          </nav>
          <span>© 2026 Foodking Concepts</span>
        </div>
      </footer>

      {storyOpen && (
        <div className="fs-story-modal" role="dialog" aria-modal="true" aria-labelledby={`fs-story-modal-title-${config.key}`}>
          <button className="fs-icon-button fs-story-modal__close" type="button" aria-label="Close kitchen story" onClick={() => setStoryOpen(false)}><X /></button>
          <div className="fs-story-modal__card">
            <img src={config.story.image} alt="" />
            <div>
              <span>{config.story.eyebrow}</span>
              <h2 id={`fs-story-modal-title-${config.key}`}>{config.story.title}</h2>
              <p>{config.story.body}</p>
              <button className="fs-button fs-button--solid" type="button" onClick={() => { setStoryOpen(false); document.getElementById(`fs-menu-${config.key}`)?.scrollIntoView({ behavior: 'smooth' }) }}>
                Taste the menu <ArrowRight />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`fs-toast ${toast ? 'is-visible' : ''}`} role="status" aria-live="polite">
        <Check size={17} />{toast}
      </div>
    </div>
  )
}

export function PurchaseScreen({ onNavigate }) {
  const purchaseTheme = {
    accent: '#f5d773',
    accent2: '#eb8dbc',
    surface: '#07133d',
    ink: '#ffffff',
    hero: '#07133d',
    heroText: '#ffffff',
    card: '#112354',
  }

  return (
    <div className="figma-screen figma-screen--premium" data-layout="purchase" style={themeStyle(purchaseTheme)}>
      <a className="fs-skip-link" href="#premium-screen-gallery">Skip to screen previews</a>
      <main className="fp-premium">
        <header className="fp-premium__mast">
          <span className="fp-premium__wordmark">figma<span>market</span></span>
          <span>Restaurant Website Template</span>
        </header>

        <section className="fp-premium__intro" aria-labelledby="premium-title">
          <div>
            <p className="fp-premium__eyebrow">TasteNest · full design collection</p>
            <h1 id="premium-title">Enjoyed This?<br /><em>Unlock More</em> In The<br />Premium Edition!</h1>
            <a className="fp-premium__unlock" href="#premium-screen-gallery">
              <LockKeyhole size={16} aria-hidden="true" />
              <span>Unlock Premium Access</span>
              <ArrowRight size={17} aria-hidden="true" />
            </a>
          </div>
          <aside className="fp-premium__edition" aria-label="Template contents">
            <strong>12</strong>
            <span>responsive<br />screen routes</span>
            <p>Purchase · Homes 1–10 · Coffee</p>
          </aside>
        </section>

        <section className="fp-premium__gallery" id="premium-screen-gallery" aria-labelledby="premium-gallery-title">
          <div className="fp-premium__gallery-heading">
            <p>Premium preview</p>
            <h2 id="premium-gallery-title">Every screen, ready to open.</h2>
          </div>
          <div className="fp-premium__grid">
            {screenOrder.map((key, index) => {
              const config = screenDefinitions[key]
              return (
                <ScreenLink
                  className="fp-premium-card"
                  href={config.path}
                  onNavigate={onNavigate}
                  key={key}
                  aria-label={`Open ${config.frame}`}
                  style={{ '--fp-card-accent': config.theme.accent, '--fp-card-hero': config.theme.hero, '--fp-card-surface': config.theme.surface }}
                >
                  <span className="fp-premium-card__number">{String(index + 1).padStart(2, '0')}</span>
                  <span className="fp-premium-card__window">
                    <span className="fp-premium-card__bar"><i /><i /><i /></span>
                    <img src={config.heroImage} alt="" loading={index < 3 ? 'eager' : 'lazy'} decoding="async" />
                    <span className="fp-premium-card__shade" />
                    <b>{config.title ?? config.frame}</b>
                    <i className="fp-premium-card__accent" />
                  </span>
                  <span className="fp-premium-card__caption"><strong>{config.frame}</strong><small>Open screen <ArrowUpRight size={13} /></small></span>
                </ScreenLink>
              )
            })}
            <ScreenLink className="fp-premium-card fp-premium-card--full" href="/home-1" onNavigate={onNavigate}>
              <span>FULL<br />PROJECT</span>
              <ArrowUpRight size={30} aria-hidden="true" />
              <small>Start exploring</small>
            </ScreenLink>
          </div>
        </section>
      </main>
    </div>
  )
}

export const Home1Screen = (props) => <FigmaHomeScreen screenKey="home-1" {...props} />
export const Home2Screen = (props) => <FigmaHomeScreen screenKey="home-2" {...props} />
export const Home3Screen = (props) => <FigmaHomeScreen screenKey="home-3" {...props} />
export const Home4Screen = (props) => <FigmaHomeScreen screenKey="home-4" {...props} />
export const Home6Screen = (props) => <FigmaHomeScreen screenKey="home-6" {...props} />
export const Home7Screen = (props) => <FigmaHomeScreen screenKey="home-7" {...props} />
export const Home8Screen = (props) => <FigmaHomeScreen screenKey="home-8" {...props} />
export const Home9Screen = (props) => <FigmaHomeScreen screenKey="home-9" {...props} />
export const Home10Screen = (props) => <FigmaHomeScreen screenKey="home-10" {...props} />
export const HomeCoffeeScreen = (props) => <FigmaHomeScreen screenKey="home-coffee" {...props} />

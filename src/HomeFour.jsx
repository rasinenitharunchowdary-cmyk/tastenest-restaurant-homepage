import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Camera,
  Heart,
  Menu,
  Plus,
  ShoppingBag,
  Star,
  Truck,
  UtensilsCrossed,
  X,
} from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const asset = (name) => `/assets/${name}`

const heroSlides = [
  { label: 'Crispy, Every Bite Taste', title: ['HOT SPICY', 'CHIKEN', 'BURGER'], price: '$5', image: 'burger.webp' },
  { label: 'Fresh From Our Kitchen', title: ['DOUBLE', 'CHEESE', 'BURGER'], price: '$8', image: 'burger-fries.webp' },
  { label: 'A Stack Above The Rest', title: ['SMOKEY', 'GRILL', 'BURGER'], price: '$7', image: 'food-table.webp' },
]

const categoryItems = [
  { title: 'Chiken', count: '8 Products', image: 'grilled-chicken.webp', tone: 'coral' },
  { title: 'Pro Burger', count: '8 Products', image: 'burger.webp', tone: 'gold' },
  { title: 'Pro Pasta', count: '3 Products', image: 'fries.webp', tone: 'green' },
  { title: 'Pro Pizza', count: '3 Products', image: 'pizza.webp', tone: 'violet' },
]

const products = [
  { name: 'Delicious Burger', old: '$76.00', price: '$59.00', discount: '-20%', image: 'burger.webp', accent: 'red' },
  { name: 'Grilled Chiken', old: '$72.00', price: '$54.00', discount: '-25%', image: 'grilled-chicken.webp', accent: 'yellow' },
  { name: 'Ruti With Chiken', old: '$69.00', price: '$49.00', discount: '-15%', image: 'food-table.webp', accent: 'green' },
  { name: 'Fast Food Combo', old: '$84.00', price: '$64.00', discount: '-20%', image: 'burger-fries.webp', accent: 'pink' },
  { name: 'Chicago Deep Pizza', old: '$69.00', price: '$53.00', discount: '-23%', image: 'cheese-pizza.webp', accent: 'orange' },
  { name: 'Chinese Pasta', old: '$49.00', price: '$39.00', discount: '-15%', image: 'pasta.webp', accent: 'green' },
  { name: 'Whopper Burger King', old: '$82.00', price: '$62.00', discount: '-25%', image: 'burger-fries.webp', accent: 'red' },
  { name: 'Ruti With Beef Slice', old: '$73.00', price: '$57.00', discount: '-18%', image: 'tacos.webp', accent: 'gold' },
]

const sponsors = ['foodora', 'freshio', 'UBER EATS', 'FOODPANDA', 'eats', 'GLOVO']

function Logo({ light = false }) {
  return (
    <a className={`h4-logo ${light ? 'h4-logo--light' : ''}`} href="#top" aria-label="TasteNest home">
      <span className="h4-logo__mark"><UtensilsCrossed size={17} strokeWidth={2.7} /></span>
      <span className="h4-logo__type">Taste<span>Nest</span><small>Fast Food Restaurant</small></span>
    </a>
  )
}

function OrderButton({ children = 'Order Now', className = '', onClick }) {
  return (
    <button className={`h4-order-button ${className}`} type="button" onClick={onClick}>
      <Truck size={15} aria-hidden="true" />
      <span>{children}</span>
      <ArrowRight size={15} aria-hidden="true" />
    </button>
  )
}

function SectionTitle({ eyebrow = 'CRISPY, EVERY BITE TASTE', title, copy, id }) {
  return (
    <header className="h4-section-title" data-reveal>
      <p className="h4-eyebrow"><span />{eyebrow}</p>
      <h2 id={id}>{title}</h2>
      {copy && <p className="h4-section-title__copy">{copy}</p>}
    </header>
  )
}

function ProductCard({ product, onAdd, favourite, onFavourite }) {
  return (
    <article className="h4-product-card" data-reveal>
      <div className={`h4-product-card__media h4-product-card__media--${product.accent}`}>
        <span className="h4-product-card__sale">{product.discount}</span>
        <button
          className={`h4-wish ${favourite ? 'is-active' : ''}`}
          type="button"
          aria-label={`Save ${product.name}`}
          aria-pressed={favourite}
          onClick={onFavourite}
        >
          <Heart size={16} fill={favourite ? 'currentColor' : 'none'} />
        </button>
        <img src={asset(product.image)} alt="" />
      </div>
      <div className="h4-product-card__body">
        <div className="h4-stars" aria-label="5 out of 5 stars"><Star size={11} fill="currentColor" /> <Star size={11} fill="currentColor" /> <Star size={11} fill="currentColor" /> <Star size={11} fill="currentColor" /> <Star size={11} fill="currentColor" /></div>
        <h3>{product.name}</h3>
        <p><del>{product.old}</del> <strong>{product.price}</strong></p>
        <button className="h4-product-card__add" type="button" onClick={() => onAdd(product.name)}>
          <Plus size={17} /> <span>Add To Cart</span>
        </button>
      </div>
    </article>
  )
}

export default function HomeFour() {
  const rootRef = useRef(null)
  const offerCanvasRef = useRef(null)
  const toastTimeout = useRef(null)
  const [loaded, setLoaded] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [heroIndex, setHeroIndex] = useState(0)
  const [categoryIndex, setCategoryIndex] = useState(0)
  const [favourites, setFavourites] = useState([])
  const [toast, setToast] = useState('')
  const hero = heroSlides[heroIndex]

  const announce = (message) => {
    window.clearTimeout(toastTimeout.current)
    setToast(message)
    toastTimeout.current = window.setTimeout(() => setToast(''), 2400)
  }

  const addToCart = (name) => {
    setCartCount((count) => count + 1)
    announce(`${name} added to your basket`)
  }

  const moveCategory = (direction) => {
    setCategoryIndex((current) => (current + direction + categoryItems.length) % categoryItems.length)
  }

  useEffect(() => {
    const start = window.setTimeout(() => setLoaded(true), 850)
    return () => window.clearTimeout(start)
  }, [])

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return undefined
    const lenis = new Lenis({ duration: 1.06, smoothWheel: true, wheelMultiplier: 0.9, anchors: true })
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
    document.body.classList.toggle('h4-no-scroll', menuOpen)
    return () => document.body.classList.remove('h4-no-scroll')
  }, [menuOpen])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        setCartOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || !offerCanvasRef.current) return undefined
    let effect
    let stopped = false

    Promise.all([import('three'), import('vanta/dist/vanta.fog.min')]).then(([THREE, module]) => {
      const fog = module.default?.default ?? module.default
      if (stopped || !offerCanvasRef.current || typeof fog !== 'function') return
      effect = fog({
        el: offerCanvasRef.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 220,
        minWidth: 320,
        highlightColor: 0xb31016,
        midtoneColor: 0x210708,
        lowlightColor: 0x050505,
        baseColor: 0x070707,
        blurFactor: 0.62,
        speed: 0.48,
        zoom: 0.72,
      })
    }).catch(() => {})

    return () => {
      stopped = true
      effect?.destroy()
    }
  }, [])

  useLayoutEffect(() => {
    if (!loaded || !rootRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const context = gsap.context(() => {
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      heroTl
        .from('.h4-hero__copy > *', { y: 34, opacity: 0, duration: 0.7, stagger: 0.09 })
        .from('.h4-hero__food', { scale: 0.88, x: 70, opacity: 0, duration: 1.1 }, '-=0.85')
        .from('.h4-hero__orbit, .h4-hero__deal', { scale: 0.5, opacity: 0, duration: 0.7, stagger: 0.1 }, '-=0.6')

      gsap.utils.toArray('[data-reveal]').forEach((element) => {
        gsap.fromTo(element, { y: 42, opacity: 0 }, {
          y: 0,
          opacity: 1,
          duration: 0.78,
          ease: 'power3.out',
          scrollTrigger: { trigger: element, start: 'top 89%', once: true },
        })
      })
    }, rootRef)
    return () => context.revert()
  }, [loaded])

  const handleHeroMove = (event) => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width - 0.5
    const y = (event.clientY - bounds.top) / bounds.height - 0.5
    event.currentTarget.style.setProperty('--move-x', `${x * 14}px`)
    event.currentTarget.style.setProperty('--move-y', `${y * 12}px`)
  }

  const toggleFavourite = (name) => {
    setFavourites((items) => (items.includes(name) ? items.filter((item) => item !== name) : [...items, name]))
  }

  return (
    <div className="h4-page" ref={rootRef} id="top">
      <a className="h4-skip-link" href="#main-content">Skip to content</a>

      <div className={`h4-loader ${loaded ? 'is-done' : ''}`} aria-hidden={loaded}>
        <div className="h4-loader__brand"><span>TN</span><b>TasteNest</b></div>
        <i />
        <small>Preparing the good stuff</small>
      </div>

      <header className="h4-header">
        <div className="h4-shell h4-header__inner">
          <Logo />
          <nav className="h4-nav" aria-label="Primary navigation">
            <a href="#top" className="is-current">Home <ChevronDown size={11} /></a>
            <a href="#about">About Us</a>
            <a href="#menu">Shop <ChevronDown size={11} /></a>
            <a href="#journal">Blog <ChevronDown size={11} /></a>
            <a href="#deals">Pages <ChevronDown size={11} /></a>
            <a href="#footer">Contact</a>
          </nav>
          <div className="h4-header__actions">
            <button className="h4-bag-button" type="button" onClick={() => setCartOpen((open) => !open)} aria-label="Open shopping basket" aria-expanded={cartOpen}>
              <ShoppingBag size={19} />
              <span>{cartCount}</span>
            </button>
            <a href="#footer" className="h4-contact-button">Contact Us</a>
            <button className="h4-menu-button" type="button" aria-label="Open navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}><Menu size={22} /></button>
          </div>
        </div>
      </header>

      <aside className={`h4-cart ${cartOpen ? 'is-open' : ''}`} aria-label="Your order">
        <button type="button" className="h4-cart__close" onClick={() => setCartOpen(false)} aria-label="Close basket"><X size={18} /></button>
        <ShoppingBag size={25} />
        <p>Your basket</p>
        <strong>{cartCount} {cartCount === 1 ? 'item' : 'items'}</strong>
        <button type="button" onClick={() => { setCartOpen(false); announce('Checkout is ready for your details') }}>Checkout <ArrowRight size={15} /></button>
      </aside>

      <aside className={`h4-mobile-nav ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen}>
        <div className="h4-mobile-nav__head"><Logo light /><button type="button" onClick={() => setMenuOpen(false)} aria-label="Close navigation"><X /></button></div>
        <nav>
          {['Home', 'About Us', 'Shop', 'Blog', 'Pages', 'Contact'].map((label, index) => <a key={label} href={['#top', '#about', '#menu', '#journal', '#deals', '#footer'][index]} onClick={() => setMenuOpen(false)}>{label}<ArrowRight size={18} /></a>)}
        </nav>
        <p>Fresh flavours. Fast delivery.<br />Every day of the week.</p>
      </aside>

      <main id="main-content">
        <section className="h4-hero" onPointerMove={handleHeroMove}>
          <div className="h4-hero__grain" />
          <div className="h4-shell h4-hero__inner">
            <div className="h4-hero__copy">
              <p className="h4-hero__eyebrow"><span>✦</span>{hero.label}</p>
              <h1>{hero.title.map((line) => <span key={line}>{line}</span>)}</h1>
              <div className="h4-hero__price"><span>Limited Offer</span><strong>{hero.price}</strong></div>
              <OrderButton onClick={() => addToCart('Hot spicy chicken burger')} />
            </div>
            <div className="h4-hero__visual" aria-label="Today’s best deal">
              <span className="h4-hero__script">today’s best deal</span>
              <span className="h4-hero__orbit h4-hero__orbit--one" />
              <span className="h4-hero__orbit h4-hero__orbit--two" />
              <span className="h4-hero__chili h4-hero__chili--one">✦</span>
              <span className="h4-hero__chili h4-hero__chili--two">✦</span>
              <div className="h4-hero__food"><img src={asset(hero.image)} alt="Stacked spicy chicken burger" /></div>
              <div className="h4-hero__deal"><span>Only</span><b>{hero.price}</b><small>Best Deal</small></div>
            </div>
            <div className="h4-hero__dots" role="tablist" aria-label="Featured offers">
              {heroSlides.map((slide, index) => <button key={slide.price} type="button" role="tab" aria-selected={index === heroIndex} aria-label={`Show offer ${index + 1}`} className={index === heroIndex ? 'is-active' : ''} onClick={() => setHeroIndex(index)} />)}
            </div>
          </div>
        </section>

        <section className="h4-categories" aria-labelledby="popular-food-title">
          <div className="h4-shell">
            <SectionTitle id="popular-food-title" title={<>Popular Food <em>Items</em></>} />
            <div className="h4-category-carousel">
              <button type="button" aria-label="Previous food category" onClick={() => moveCategory(-1)}><ChevronLeft /></button>
              <div className="h4-category-track" style={{ '--category-shift': categoryIndex }}>
                {categoryItems.map((item, index) => (
                  <article className={`h4-category-card h4-category-card--${item.tone} ${index === categoryIndex ? 'is-featured' : ''}`} key={item.title} onClick={() => setCategoryIndex(index)}>
                    <div><span>{String(index + 1).padStart(2, '0')}</span><img src={asset(item.image)} alt="" /></div>
                    <h3>{item.title}</h3>
                    <p>{item.count}</p>
                  </article>
                ))}
              </div>
              <button type="button" aria-label="Next food category" onClick={() => moveCategory(1)}><ChevronRight /></button>
            </div>
          </div>
        </section>

        <section className="h4-promo-pair h4-shell" id="deals">
          <article className="h4-promo h4-promo--black" data-reveal>
            <div className="h4-promo__copy"><p>CRISPY, EVERY BITE TASTE</p><h2>SUPER<br /><em>DELICIOUS</em></h2><button type="button" onClick={() => addToCart('Super delicious burger')}>Order Now <ArrowRight size={15} /></button></div>
            <span className="h4-promo__round">50%<small>OFF</small></span>
            <img src={asset('burger-fries.webp')} alt="Gourmet burger and fries" />
          </article>
          <article className="h4-promo h4-promo--pizza" data-reveal>
            <div className="h4-promo__copy"><p>CRISPY, EVERY BITE TASTE</p><h2>Super Delicious<br /><em>Cheese PIZZA</em></h2><button type="button" onClick={() => addToCart('Cheese pizza')}>Order Now <ArrowRight size={15} /></button></div>
            <span className="h4-promo__limited">Limited<br />Offer</span>
            <img src={asset('cheese-pizza.webp')} alt="Cheese pizza" />
          </article>
        </section>

        <section className="h4-sponsors" aria-label="Our sponsors">
          <div className="h4-shell h4-sponsors__inner">
            <p><strong>GLOBAL 5K+</strong> HAPPY SPONSORS WITH US</p>
            <div>{sponsors.map((sponsor) => <span key={sponsor}>{sponsor}</span>)}</div>
          </div>
        </section>

        <section className="h4-spotlight" ref={offerCanvasRef}>
          <div className="h4-spotlight__texture" />
          <div className="h4-shell h4-spotlight__inner">
            <div className="h4-spotlight__copy" data-reveal>
              <p>Save <strong>20%</strong></p>
              <h2>Today’s <em>Astackin</em> Day</h2>
              <span>Grilled Chiken <b>$59,00</b></span>
              <OrderButton onClick={() => addToCart('Grilled chicken')} />
            </div>
            <div className="h4-spotlight__art" data-reveal><img src={asset('grilled-chicken.webp')} alt="Grilled chicken plate" /><span>HOT<br />DEAL</span></div>
          </div>
        </section>

        <section className="h4-products" id="menu">
          <div className="h4-shell">
            <SectionTitle title={<>Popular Fast <em>Foods</em></>} copy="A little something delicious for every kind of hunger." />
            <div className="h4-products__grid">
              {products.map((product) => <ProductCard key={product.name} product={product} onAdd={addToCart} favourite={favourites.includes(product.name)} onFavourite={() => toggleFavourite(product.name)} />)}
            </div>
            <div className="h4-products__more"><button type="button" onClick={() => announce('All signature fast foods are now showing')}>View More <ArrowRight size={16} /></button></div>
          </div>
        </section>

        <section className="h4-combo" id="about">
          <div className="h4-combo__pattern" />
          <div className="h4-shell h4-combo__grid">
            <div className="h4-combo__copy" data-reveal>
              <p className="h4-eyebrow"><span />CRISPY, EVERY BITE TASTE</p>
              <h2>Trending Food<br />Combo Offer<br /><em>Less 20%</em></h2>
              <div className="h4-combo__offers">
                <span><b>COCA COLA</b><small>Enjoy Food</small><strong>50%<i>OFF</i></strong></span>
                <span><b>BURGER</b><small>Best Deal</small><strong>$5<i>ONLY</i></strong></span>
                <span><b>FAST FOOD</b><small>Hot Taste</small><strong>20%<i>OFF</i></strong></span>
              </div>
              <OrderButton onClick={() => addToCart('Trending food combo')} />
            </div>
            <div className="h4-combo__visual" data-reveal>
              <div className="h4-combo__brick" />
              <img src={asset('burger-fries.webp')} alt="Burger combo and cola" />
              <span className="h4-combo__can">COLA</span>
            </div>
          </div>
        </section>

        <section className="h4-dishes-marquee" aria-label="Popular dishes">
          <div><span>POPULER DISHES</span><i>✦</i><span>POPULER DISHES</span><i>✦</i><span>POPULER DISHES</span></div>
        </section>

        <section className="h4-service-features">
          <div className="h4-shell h4-service-features__panel" data-reveal>
            <article><span>01</span><UtensilsCrossed /><div><h3>Super Quality Food</h3><p>Made with fresh ingredients</p></div></article>
            <article><span>02</span><Star /><div><h3>Original Recipes</h3><p>Taste you can remember</p></div></article>
            <article><span>03</span><Truck /><div><h3>Quick Fast Delivery</h3><p>Hot at your doorstep</p></div></article>
            <article><span>04</span><Heart /><div><h3>100% Fresh Foods</h3><p>Always made to order</p></div></article>
          </div>
        </section>

        <section className="h4-about" id="about">
          <div className="h4-shell h4-about__grid">
            <div className="h4-about__visual" data-reveal>
              <span className="h4-about__zero">$0</span>
              <span className="h4-about__since">SINCE 1985</span>
              <div><img src={asset('burger.webp')} alt="TasteNest signature burger" /></div>
              <span className="h4-about__leaf">✦</span>
            </div>
            <div className="h4-about__copy" data-reveal>
              <p className="h4-eyebrow"><span />About Our Food</p>
              <h2>Where Quality Meet<br />Excellent <em>Service.</em></h2>
              <p className="h4-about__body">We believe great food should feel effortless. TasteNest is made for hungry people who expect generous flavour, fresh ingredients and a warm welcome in every order.</p>
              <div className="h4-about__points"><span><b><UtensilsCrossed size={19} /></b><strong>Super Quality Food<small>Fresh ingredients in every meal</small></strong></span><span><b><Heart size={19} /></b><strong>Well Reputation<small>Loved by local food fans</small></strong></span></div>
              <button type="button" className="h4-about__button" onClick={() => announce('More about TasteNest is coming right up')}>More About Us <ArrowRight size={16} /></button>
            </div>
          </div>
        </section>

        <section className="h4-mini-promos h4-shell">
          <article className="h4-mini-promo h4-mini-promo--burger" data-reveal><div><p>CRISPY, EVERY BITE TASTE</p><h2>Today Special<br /><em>Beef Burger</em></h2><OrderButton onClick={() => addToCart('Today special beef burger')} /></div><img src={asset('burger-fries.webp')} alt="Special beef burger" /></article>
          <article className="h4-mini-promo h4-mini-promo--meal" data-reveal><div><p>CRISPY, EVERY BITE TASTE</p><h2><em>FAST</em> Foods Meal</h2><OrderButton onClick={() => addToCart('Fast foods meal')} /></div><img src={asset('food-table.webp')} alt="Fast food meal" /></article>
        </section>

        <section className="h4-hotwing-deal">
          <div className="h4-hotwing-deal__grid h4-shell" data-reveal>
            <div className="h4-hotwing-deal__photo"><img src={asset('wings.webp')} alt="Chicken hot wings and fries" /><span className="h4-hotwing-deal__cola">COLA</span><span className="h4-hotwing-deal__seal">HOT<br />TASTE</span></div>
            <div className="h4-hotwing-deal__copy"><p className="h4-eyebrow"><span />CRISPY, EVERY BITE TASTE</p><h2>Kfc Chiken Hot Wing<br />&amp; French Fries</h2><p>Simple ingredients, generous taste and a limited-time price that makes every bite better.</p><div className="h4-countdown" aria-label="Offer countdown"><span><b>30</b><small>Days</small></span><span><b>22</b><small>Hours</small></span><span><b>48</b><small>Min</small></span><span><b>22</b><small>Sec</small></span></div><OrderButton onClick={() => addToCart('KFC chicken hot wing and french fries')} /></div>
          </div>
        </section>

        <section className="h4-testimonial">
          <div className="h4-testimonial__doodle h4-testimonial__doodle--left">✦</div><div className="h4-testimonial__doodle h4-testimonial__doodle--right">✦</div>
          <div className="h4-shell h4-testimonial__inner" data-reveal><p className="h4-eyebrow"><span />CUSTOMER REVIEW</p><div className="h4-testimonial__stars"><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /></div><blockquote>“The burger was hot, stacked high and seriously delicious. Every order feels like it came straight from the grill.”</blockquote><div className="h4-testimonial__person"><img src={asset('chef.webp')} alt="Piter Bowman" /><div><h3>Piter Bowman</h3><p>Business CEO &amp; Co Founder</p></div></div><div className="h4-testimonial__avatars"><img src={asset('chef.webp')} alt="" /><img src={asset('salad-colorful.webp')} alt="" /><img src={asset('food-table.webp')} alt="" /></div></div>
        </section>

        <section className="h4-delivery-banner">
          <div className="h4-shell h4-delivery-banner__inner" data-reveal><div><p>WE DELIVER YOUR FAVOURITE FOOD</p><h2><em>30 Minutes</em> Fast<br />Delivery Challenge</h2><OrderButton className="h4-order-button--light" onClick={() => addToCart('TasteNest delivery')} /></div><div className="h4-delivery-banner__rider"><span className="h4-delivery-banner__wheel h4-delivery-banner__wheel--one" /><span className="h4-delivery-banner__wheel h4-delivery-banner__wheel--two" /><span className="h4-delivery-banner__box">HOT<br />FOOD</span><Truck /></div></div>
        </section>

        <section className="h4-gallery" id="journal" aria-label="TasteNest food gallery">
          {['pizza.webp', 'burger.webp', 'pasta.webp', 'tacos.webp'].map((image, index) => <div key={image}><img src={asset(image)} alt={`TasteNest dish ${index + 1}`} /><span>+</span></div>)}
        </section>
      </main>

      <footer className="h4-footer" id="footer">
        <div className="h4-shell h4-footer__hours" data-reveal><div><Logo light /><strong>Opening Hours</strong><p>Mon – Sat: <b>09:00 – 22:00</b><br />Sunday: <b>10:00 – 20:00</b></p></div><div><span>★★★★★</span><b>Tripadvisor</b><small>Travellers’ Choice Award</small></div></div>
        <div className="h4-shell h4-footer__top">
          <div className="h4-footer__intro"><h3>About Restaurant</h3><p>Craving something bold? We make every bite a little more memorable. Get your favourite fast food, fast.</p><div><a href="#journal" aria-label="Food gallery"><Camera size={17} /></a><a href="#about" aria-label="TasteNest community"><Heart size={17} /></a><a href="#menu" aria-label="TasteNest menu"><UtensilsCrossed size={17} /></a></div></div>
          <div><h3>Food Menu</h3><a href="#menu">Burgers</a><a href="#menu">Chicken Fry</a><a href="#menu">Pizza</a><a href="#menu">Pasta &amp; More</a></div>
          <div><h3>Quick Links</h3><a href="#about">About Us</a><a href="#deals">Best Deals</a><a href="#journal">Our Gallery</a><a href="#footer">Contact Us</a></div>
          <div className="h4-footer__newsletter"><h3>Newsletter</h3><p>Get tasty updates and offers.</p><label><span className="sr-only">Email address</span><input type="email" placeholder="Your email address" /><button type="button" onClick={() => announce('Thanks — your newsletter spot is saved')}>Subscribe</button></label></div>
        </div>
        <div className="h4-shell h4-footer__bottom"><span>© 2026 TasteNest. All Rights Reserved.</span><span>Privacy Policy &nbsp; / &nbsp; Terms &amp; Conditions</span></div>
      </footer>

      <div className={`h4-toast ${toast ? 'is-visible' : ''}`} role="status" aria-live="polite">{toast}</div>
    </div>
  )
}

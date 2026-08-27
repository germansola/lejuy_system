"use client"
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { Fade } from "react-awesome-reveal";


interface cardDataType {
    imgSrc: string;
    heading: string;
    subheading: string;
    width: number;
    height: number;
    imgClass: string;
    link: string;
}

// width / height son las medidas reales de cada archivo: next/image las usa
// para reservar el espacio con la proporcion correcta, no para dimensionar.
// imgClass fija el ancho y la altura a la que flota cada icono sobre su tarjeta.
// Va por tarjeta porque los archivos no son comparables: featureOne/Two son un
// circulo de 110px dentro de un lienzo de 256 (mucho aire abajo), mientras que
// klipartz y logo_jujuy vienen recortados al ras del dibujo.
const cardData: cardDataType[] = [
    {
        imgSrc: '/images/Features/featureOne.svg',
        heading: "Porotos Don Prisco",
        subheading: "De nuestro campo a tu mesa, Conocelos!",
        width: 256,
        height: 256,
        imgClass: 'max-w-[288px] -top-[110px]',
        link: 'Learn more'
    },
    {
        imgSrc: '/images/Features/featureTwo.svg',
        heading: "Nuestros variedades",
        subheading: "¿curioso por saber mas? Conocelos!",
        width: 256,
        height: 256,
        imgClass: 'max-w-[288px] -top-[110px]',
        link: 'Learn more'
    },
    {
        imgSrc: '/images/Features/klipartz.svg',
        heading: "Valor Nutricional",
        subheading: "El consumo de legumbres es beneficioso para la salud",
        width: 1020,
        height: 970,
        imgClass: 'max-w-[175px] -top-[116px]',
        link: 'Learn more'
    },
    {
        imgSrc: '/images/Features/logo_jujuy.png',
        heading: "Nuestra provincia",
        subheading: "Enriquecidos con la cultura jujeña",
        width: 1664,
        height: 1138,
        imgClass: 'max-w-[210px] -top-[94px]',
        link: 'Learn more'
    }

]

const Work = () => {
    return (


        <div>
            <div className='mx-auto max-w-7xl py-40 px-6' id="about-section">
                <div className='text-center mb-14' >
                    <Fade direction={'up'} delay={400} cascade damping={1e-1} triggerOnce={true}>
                        <h3 className='text-pink text-lg font-normal mb-3 ls-51 uppercase'>¿Porque Elegirnos?</h3>
                    </Fade>
                    <Fade direction={'up'} delay={800} cascade damping={1e-1} triggerOnce={true}>
                        <p className='text-3xl lg:text-5xl font-semibold text-lightgrey'>Nuestro productos son <br /> de alta calidad.</p>
                    </Fade>
                </div>


                <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-y-32 gap-x-5 mt-32'>
                    <Fade direction={'up'} delay={1000} cascade damping={1e-1} triggerOnce={true}>
                        {cardData.map((items, i) => (
                            <div className='card-b p-8 relative rounded-3xl' key={i}>
                                <div className={`work-img-bg rounded-full absolute inset-x-0 mx-auto ${items.imgClass}`}>
                                    <Image src={items.imgSrc} alt={items.heading} width={items.width} height={items.height} sizes='290px' className='w-full h-auto' />
                                </div>
                                <h3 className='text-2xl text-black font-semibold text-center mt-16'>{items.heading}</h3>
                                <p className='text-lg font-normal text-black text-center text-opacity-50 mt-2'>{items.subheading}</p>
                                <div className='flex items-center justify-center'>
                                    <Link href='/'><p className='text-center text-lg font-medium text-pink mt-2 hover-underline'>{items.link}<ChevronRightIcon width={20} height={20} /></p></Link>
                                </div>
                            </div>
                        ))}
                    </Fade>
                </div>
            </div>
        </div>

    )
}

export default Work;

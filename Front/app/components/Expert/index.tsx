"use client"
import Slider from "react-slick";
import React, { Component } from "react";
import Image from "next/image";
import { Fade } from "react-awesome-reveal";

// CAROUSEL DATA

interface DataType {
    profession: string;
    name: string;
    imgSrc: string;
}

const postData: DataType[] = [
    {
        profession: 'Fundador',
        name: 'Prisco Sola Garcia',
        imgSrc: '/images/Expert/poroto_laburante.png',
    },
    {
        profession: 'Co-Fundadora',
        name: 'Patricia T. Romero',
        imgSrc: '/images/Expert/poroto_laburante.png',
    },
    {
        profession: 'EL CRACK',
        name: 'Ramiro G. Sola',
        imgSrc: '/images/Expert/poroto_laburante.png',
    },
]

// CAROUSEL SETTINGS


export default class MultipleItems extends Component {

    render() {
        const settings = {
            dots: false,
            infinite: true,
            slidesToShow: 3,
            centerMode: true,
            slidesToScroll: 1,
            arrows: false,
            autoplay: false,
            speed: 4000,
            autoplaySpeed: 2000,
            cssEase: "linear",
            responsive: [
                {
                    breakpoint: 1200,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 1,
                        infinite: true,
                        dots: false
                    }
                },
                {
                    breakpoint: 800,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 1,
                        infinite: true,
                        dots: false
                    }
                },
                {
                    breakpoint: 450,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        infinite: true,
                        dots: false
                    }
                }
            ]
        };


        return (
            <div className="py-10 sm:py-20 bg-darkpink">

                <div className='mx-auto max-w-2xl lg:max-w-7xl sm:py-4 lg:px-8'>
                    <div className="text-center">
                        <Fade direction={'up'} delay={400} cascade damping={1e-1} triggerOnce={true}>
                            <h2 className='text-pink text-lg font-normal mb-3 tracking-widest uppercase ls-51'>Expertos en el campo</h2>
                        </Fade>
                        <Fade direction={'up'} delay={800} cascade damping={1e-1} triggerOnce={true}>
                            <h3 className="text-3xl lg:text-5xl font-semibold text-black">
                                Conozca a nuestro equipo.
                            </h3>
                        </Fade>
                    </div>

                    <Slider {...settings}>
                        {postData.map((items, i) => (
                            <div key={i}>
                                <div className='m-3 py-14 my-10 text-center'>
                                    <div className="relative mx-auto w-full max-w-[362px] aspect-square">
                                        <Image src={items.imgSrc} alt={items.name} width={600} height={600} sizes="362px" className="w-full h-full rounded-full object-cover" />
                                        {/* El circulo visible de Linkedin.svg no esta centrado en su lienzo: es
                                            cx=119 cy=63 r=41 sobre 238x239, o sea al 50% de ancho y al 26.4% de
                                            alto, y ocupa el 34.45% de la caja. Por eso la caja mide 51% (para que
                                            el circulito quede en ~17.6% del avatar) y se corre -26.4% en Y: asi el
                                            punto que se apoya en el borde es el circulo, no la caja vacia.
                                            85.36% = 50% + 35.36%, que es donde la diagonal a 45 grados corta la
                                            circunferencia. */}
                                        <Image src={'/images/Expert/Linkedin.svg'} alt="LinkedIn" width={238} height={239} className="absolute left-[85.36%] top-[85.36%] w-[51%] h-auto -translate-x-1/2 -translate-y-[26.4%]" />
                                    </div>
                                    <h3 className='text-2xl font-semibold text-lightblack'>{items.name}</h3>
                                    <h4 className='text-lg font-normal text-lightblack pt-4 pb-2 opacity-50'>{items.profession}</h4>
                                </div>
                            </div>
                        ))}
                    </Slider>

                </div>
            </div>

        );
    }
}

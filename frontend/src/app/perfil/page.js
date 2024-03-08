"use client"
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from '../perfil.module.css';

export default function UserProfile({ userEmail }) {
    const [userProfile, setUserProfile] = useState({
        name: '',
        email: '',
        aboutMe: '',
        socialLinks: [],
        profilePic: ''
    });

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Extrai o email da URL
        const queryParams = new URLSearchParams(window.location.search);
        const userEmail = queryParams.get('email');

        // Função para carregar dados do usuário
        const loadUserProfile = async () => {
            if (!userEmail) return; // Garante que o email foi fornecido
            setIsLoading(true);
            try {
                const response = await fetch(`http://localhost:3001/profile/info/${encodeURIComponent(userEmail)}`);
                if (response.ok) {
                    const userData = await response.json();
                    setUserProfile({
                        ...userData,
                        // Verifica se social_links é uma string; se for, converte para array. Caso contrário, usa como está, mas garante que seja um array.
                        socialLinks: typeof userData.social_links === 'string' ? [userData.social_links] : (Array.isArray(userData.social_links) ? userData.social_links : []),
                        profilePic: userData.profile_pic
                    });
                    setIsLoading(false);
                } else {
                    throw new Error('Usuário não encontrado.');
                }
            } catch (error) {
                console.error('Erro ao carregar perfil do usuário:', error);
                setIsLoading(false);
            }
        };

        loadUserProfile();
    }, [userEmail]);

    // Função para exibir o link de forma mais limpa
    const displayLink = (link) => {
        return link.replace(/(^\w+:|^)\/\/(www\.)?/, '');
    };

    // Função para mostrar os links de redes sociais como uma lista
    const socialLinksList = userProfile.socialLinks.map((link, index) => (
        <li key={index} className={styles.socialLinkItem}>
            <a href={link} target="_blank" rel="noopener noreferrer" className={styles.socialLinkButton}>
                {displayLink(link)}
            </a>
        </li>
    ));

    // Constrói a URL da imagem usando a rota da API
    const profilePicUrl = `/api/image?filename=${encodeURIComponent(userProfile.profilePic)}`

    if (isLoading) {
        return <div className={styles.spinner}></div>; // Exibe isto enquanto `isLoading` for verdadeiro
    }

    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <div className={styles.container}>
                <div className={styles.profileBox}>
                    <h1 className={styles.profileHeading}>SEU PERFIL</h1>
                    <div className={styles.profileContent}>
                        <img className={styles.profilePic} src={profilePicUrl} alt="Foto do perfil" />
                        <div className={styles.profileDetails}>
                            <p className={styles.profileName}>{userProfile.name}</p>
                            <p className={styles.profileEmail}>{userProfile.email}</p>
                            <p className={styles.profileAbout}>{userProfile.about_me}</p>
                            <ul className={styles.socialLinksList}>{socialLinksList}</ul>
                        </div>
                    </div>
                    <button
                        className={`${styles.btn} ${styles.editButton}`}
                        type="button"
                        onClick={() => window.location.assign(`/editar?email=${encodeURIComponent(userProfile.email)}`)}
                    >
                        Editar
                    </button>
                    <button
                        className={`${styles.btn} ${styles.exitButton}`}
                        type="button"
                        onClick={() => window.location.assign(`/`)}
                    >
                        Sair
                    </button>
                </div>
            </div>
        </>
    );
}

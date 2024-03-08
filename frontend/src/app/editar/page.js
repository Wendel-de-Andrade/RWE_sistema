// EditProfile.jsx
"use client"
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from '../new_edit.module.css';

export default function EditProfile() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [aboutMe, setAboutMe] = useState('');
    const [socialLinks, setSocialLinks] = useState(['']);
    const [profilePic, setProfilePic] = useState(null);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const userEmail = queryParams.get('email');

        const loadUserData = async () => {
            if (!userEmail) return;
            setIsLoading(true);
            try {
                const response = await fetch(`http://localhost:3001/profile/info/${encodeURIComponent(userEmail)}`);
                if (response.ok) {
                    const userData = await response.json();
                    setName(userData.name);
                    setEmail(userData.email);
                    setAboutMe(userData.about_me);
                    setSocialLinks(Array.isArray(userData.social_links) ? userData.social_links : [userData.social_links].filter(Boolean));
                    // Supondo que a API devolva a URL do arquivo, você pode lidar com a exibição aqui
                    setIsLoading(false);
                } else {
                    throw new Error('Não foi possível carregar os dados do usuário.');
                }
            } catch (error) {
                console.error('Erro ao carregar os dados do usuário:', error);
                setIsLoading(false);
            }
        };

        loadUserData();
    }, []);

    const handleSocialLinkChange = (index, value) => {
        const updatedLinks = [...socialLinks];
        updatedLinks[index] = value;
        setSocialLinks(updatedLinks);
    };

    const addSocialLink = () => {
        if (socialLinks.length < 4) {
            setSocialLinks([...socialLinks, '']);
        }
    };

    const removeSocialLink = (index) => {
        const updatedLinks = [...socialLinks];
        updatedLinks.splice(index, 1);
        setSocialLinks(updatedLinks);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validação de e-mail
        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(email)) {
            alert("Por favor insira um email válido.");
            return;
        }

        // Validação de links de redes sociais
        const urlRegex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;
        for (const link of socialLinks) {
            if (link && !urlRegex.test(link)) {
                alert("Por favor insira um URL válido com http:// ou https://");
                return;
            }
        }


        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('aboutMe', aboutMe);
        socialLinks.forEach(link => {
            if (link) formData.append('socialLinks', link);
        });
        if (profilePic) formData.append('profile_pic', profilePic);

        try {
            const response = await fetch(`http://localhost:3001/profile/update/${encodeURIComponent(email)}`, {
                method: 'PUT',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                alert('Perfil atualizado com sucesso!');
                // Redirecionar para a página de perfil com o e-mail do usuário
                window.location.assign(`/perfil?email=${encodeURIComponent(email)}`);
            } else {
                const errorResponse = await response.json(); // Tentativa de capturar a resposta de erro como JSON
                if (response.status === 400 && errorResponse.error === "Formato de imagem não suportado.") {
                    alert("Tipo de imagem não suportado. Por favor, insira uma imagem em um formato compatível.");
                } else {
                    throw new Error(errorResponse.error || 'Falha ao criar perfil'); // Usa o erro da resposta, se disponível, senão usa uma mensagem padrão
                }
            }
        } catch (error) {
            alert(error.message);
        }
    };

    if (isLoading) {
        return <div className={styles.spinner}></div>; // Exibe isto enquanto `isLoading` for verdadeiro
    }

    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <div className={styles.container}>
                <div className={styles.loginBox}>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <input
                            className={styles.inputField}
                            type="text"
                            placeholder="Nome"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <input
                            className={styles.inputField}
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled
                        />
                        <textarea
                            className={styles.inputField}
                            placeholder="Sobre mim"
                            value={aboutMe}
                            onChange={(e) => setAboutMe(e.target.value)}
                            maxLength="500"
                        />
                        {socialLinks.map((link, index) => (
                            <div key={index} className={styles.socialLinkContainer}>
                                <input
                                    className={`${styles.inputField} ${styles.linkInput}`}
                                    type="text"
                                    placeholder="Link"
                                    value={link}
                                    onChange={(e) => handleSocialLinkChange(index, e.target.value)}
                                />
                                {socialLinks.length > 1 && (
                                    <button
                                        className={`${styles.btn} ${styles.removeButton}`}
                                        type="button"
                                        onClick={() => removeSocialLink(index)}
                                    >
                                        X
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            className={`${styles.btn} ${styles.addButton} ${socialLinks.length >= 4 ? styles.buttonDisabled : ''}`}
                            type="button"
                            onClick={addSocialLink}
                            disabled={socialLinks.length >= 4}
                        >
                            Adicionar Link
                        </button>
                        <input
                            className={styles.inputField}
                            type="file"
                            name="profile_pic"
                            onChange={(e) => setProfilePic(e.target.files[0])}
                        />
                        <button
                            className={`${styles.btn} ${styles.submitButton}`}
                            type="submit"
                        >
                            Salvar
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}

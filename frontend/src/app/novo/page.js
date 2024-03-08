"use client"
import { useState } from 'react';
import Head from 'next/head';
import styles from '../new_edit.module.css';

export default function CreateProfile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [socialLinks, setSocialLinks] = useState(['']);
  const [profilePic, setProfilePic] = useState(null);

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

    // Verifica se a imagem foi inserida
    if (!profilePic) {
      alert("Por favor insira uma imagem.");
      return;
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
      const response = await fetch('http://localhost:3001/profile', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message); // Ou redireciona o usuário
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
              Criar
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

"use client"
import React, { useState } from 'react';
import Head from 'next/head';
import styles from './page.module.css';

export default function EmailCheck() {
  const [email, setEmail] = useState('');

  const checkEmail = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3001/profile/${encodeURIComponent(email)}`, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.exists) {
          // Se o email existir, redireciona para o perfil
          window.location.assign(`http://localhost:3000/perfil?email=${encodeURIComponent(email)}`);
        } else {
          // Se não existir, pergunta se deseja cadastrar
          const userChoice = window.confirm('Email não encontrado. Deseja cadastrar?');
          if (userChoice) {
            // Se sim, redireciona para a página de novo cadastro
            window.location.assign('/novo');
          }
          // Se não, pode adicionar lógica para limpar o estado ou manter na tela principal
        }
      } else {
        console.error('Falha ao verificar a existência do email.');
      }
    } catch (error) {
      console.error('Erro ao verificar o email', error);
    }
  };

  return (
    <>
      <Head>
        <title>Verificação de Email</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className={styles.container}>
        <div className={styles.loginBox}>
          <h1 className={styles.heading}>ACESSE COM EMAIL</h1>
          <form onSubmit={checkEmail}>
            <input
              className={styles.inputField}
              type="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className={styles.buttons}>
              <button className={`${styles.btn} ${styles.entrar}`} type="submit">Entrar</button>
              <button className={`${styles.btn} ${styles.cadastrar}`} type="button" onClick={() => window.location.assign('/novo')}>Cadastrar</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
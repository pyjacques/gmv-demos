# gmv-demos

# 🌍 TotalEnergies – Expérience Maquette 3D BESS

Ce dépôt contient les ressources et le code source pour le développement de l'expérience interactive en 3D autour d’un container BESS (Battery Energy Storage System), destinée à la **sensibilisation aux risques liés aux nouvelles énergies**. L’objectif est de proposer une expérience pédagogique immersive permettant d’identifier les principaux composants d’un BESS ainsi que les dispositifs de sécurité associés.

## 🎯 Objectifs pédagogiques

- Identifier les **principaux composants** d’un système BESS : cellule, module, string/rack.
- Identifier les **éléments de sécurité** associés à la prévention de l’emballement thermique et à la maîtrise des incendies/explosions.

## 🧩 Structure de l’expérience

L’expérience se découpe en plusieurs écrans interactifs :

1. **Accueil & consignes**
2. **Tutoriel d’interaction (scroll & éclatement)**
3. **Manche 1** : placement d’étiquettes sur les composants (drag & drop)
4. **Manche 2** : identification des éléments de sécurité (click & validate)
5. **Écran de fin** : message de clôture

## 📂 Dossiers du projet

- `total-bess/` : Dossier principal du développement en cours (code, assets, UI, animations).
- `astro/` : **Archive figée** d’anciens éléments de configuration ou d'essais. Ce dossier n’est plus modifiable et est conservé à des fins de référence.
- `fibat/` : **Archive de travail** issue d’une phase initiale du projet. Elle ne doit pas être modifiée et est uniquement conservée pour consultation.

## 📌 Remarques

- Le projet est en **phase 2 de développement**, dédiée à l’implémentation interactive des fonctionnalités décrites dans le cahier des charges.
- La modélisation 3D du container et de ses composants a déjà été réalisée en amont.
- Toute contribution se fait désormais exclusivement dans le répertoire `total-bess/` ou selon les branches spécifiques du développement en cours.

## Démarrer un serveur local

Pour visualiser les exemples localement, exécutez :

```bash
npm install
npm start
```

Cela lance un petit serveur HTTP et sert les fichiers du dépôt sur `http://localhost:8080`.


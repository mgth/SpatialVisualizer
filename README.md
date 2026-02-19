# Spatial Visualizer

Application de visualisation 3D des objets d'un flux audio spatialisé + visualisation des layouts d'enceintes.

## Principe

- Le serveur écoute des messages OSC en UDP (port `9000` par défaut).
- Les positions reçues sont diffusées en WebSocket au front web.
- Le front affiche :
  - les **sources audio** (sphères),
  - le **layout enceintes** choisi (cubes bleus).

## Layouts d'enceintes

Les layouts sont chargés depuis le dossier `layouts/` (fichiers `.json`).

Exemple de structure:

```json
{
  "name": "Stereo",
  "speakers": [
    { "id": "L", "azimuth": -30, "elevation": 0, "distance": 1 },
    { "id": "R", "azimuth": 30, "elevation": 0, "distance": 1 }
  ]
}
```

Chaque enceinte peut être décrite soit en coordonnées sphériques (`azimuth/elevation/distance`), soit en cartésien (`x/y/z`).

## Formats OSC supportés

- `/source/position id x y z`
- `/source/<id>/position x y z`
- `/object/<id>/position x y z`
- `/channel/<id>/position x y z`
- `/source/<id>/aed azimuth elevation distance`
- Suppression: `/source/remove id` et `/source/<id>/remove`

## Lancer le projet

```bash
npm install
npm start
```

Puis ouvrir: [http://localhost:3000](http://localhost:3000)

## Vérification rapide

```bash
npm test
```

# GLOBABOX — Catalogue initial (13 départements)

Ce catalogue contient **13 fiches sources** pour mise en place de la boutique multi-catégories.

## État actuel

- `catalog/globabox-13-sourced-drafts.json`: référentiel de sourcing et recherche tarifaire.
- `src/catalog/sourcedDrafts.json`: mêmes fiches embarquées pour import par un administrateur connecté.
- Dans l'admin : **Produits → Outils du catalogue → Importer 13 produits (brouillons)**.
- L'importation est volontaire et fonctionne sur **la base D1 associée au domaine ouvert**. Testez d'abord sur `test.globabox.com` : son D1 est séparé de la production.
- Un même ID n'est pas importé deux fois. L'import n'écrase pas les produits déjà enregistrés.

## Important — contenu incomplet, pas prêt à vendre

- Les liens sont des annonces **tierces**, pas des accords avec un fournisseur. Certains sont des annonces comparables et non le modèle exact ; voir `marketResearch.status`.
- Les tarifs sont des références de marché, **pas des tarifs de revente GLOBABOX approuvés**, ni des coûts d'achat ; la marge doit être calculée après accord fournisseur.
- Le catalogue ne contient **aucune photo produit autorisée** et ne prétend pas fournir les 78 images (6 par produit). Photos de plateformes tierces non copiées sans permission. Utiliser 6 prises authentiques *du même modèle et de la même version* par produit, avec l'autorisation nécessaire.
- Toutes les fiches sont `isActive:false`, `inStock:false`, `stockStatus:'out_of_stock'`. Elles n'apparaissent pas aux clients.
- L'API refuse de publier ces références provisoires tant que les 6 images distinctes, droits d'utilisation, stock fournisseur et vérification finale ne sont pas confirmés.

## Avant publication

1. Valider les références exactes auprès d'un fournisseur, la quantité disponible, les variantes et les garanties.
2. Obtenir ou photographier 6 images réelles (faces/angles/détails/échelle/packaging) du **même produit**, et vérifier le droit d'usage.
3. Fixer un vrai prix de vente en DH après prix d'achat, livraison et marge ; ne pas reprendre automatiquement le prix d'une marketplace.
4. Vérifier descriptions, conformité et sécurité (particulièrement article bébé), dimensions et composants.
5. Renseigner les images dans Admin → Produits → Modifier. Mettre à jour les drapeaux de sourcing `needsSupplierVerification:false`, `imageRightsConfirmed:true`, `readyToPublish:true` une fois les vérifications faites, puis `inStock:true` si réellement disponible.
6. Publier via une modification authentifiée et contrôler la fiche visible, le panier et la commande sur staging.
7. Avant production, sauvegarder **globabox-db** et vérifier sa restauration, ainsi que la conservation de toutes les commandes existantes.

> Aucune opération de production ni publication d'annonce n'est déclenchée par l'ajout de ces fichiers dans GitHub.

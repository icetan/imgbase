#IMGBASE

In your terminal

    npm install -g imgbase
    imgbase style.css > style.embd.css
    
In your HTML

```html
<!--[if lt IE 9]><link rel="stylesheet" href="style.css" /><![endif]-->
<!--[if (gte IE 9)|!(IE)]><!--><link rel="stylesheet" href="style.embd.css" /><!--<![endif]-->
```

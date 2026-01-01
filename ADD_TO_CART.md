## ENDPOINT ADD TO CART ESCRITO EM PYTHON

```
@cart_bp.post('/add')
def add_to_cart():
    data = request.get_json()
    user_id = data.get('user_id')
    product_id = data.get('product_id')
    quantity = data.get('quantity', 1)

    cart_item, error = add_item_to_cart(user_id, product_id, quantity)

    if error:
        return jsonify({
            'error': True,
            'message': error
        }), 404

    return jsonify({
        'error': False,
        'message': 'Produto adicionado ao carrinho com sucesso!',
        'cart_item': cart_item.to_dict()
    }), 201
```

## SERVICE ADD TO CART ESCRITO EM PYTHON

```
def add_item_to_cart(user_public_id, product_id, quantity=1):
    user = User.get_or_none(User.public_id == user_public_id)
    if not user:
        return None, "Usuário não encontrado."
    
    cart, created = Cart.get_or_create(user=user)

    product = Product.get_or_none(Product.id == product_id)
    if not product:
        return None, "Produto não encontrado."

    cart_item, item_created = CartItem.get_or_create(
        cart=cart, 
        product=product, 
        defaults={'quantity': quantity}
    )
    
    if not item_created:
        cart_item.quantity += quantity
        cart_item.save()

    return cart_item, None

```

## MODEL CART ESCRITO EM PYTHON E PEEWEE

```
class Cart(BaseModel):
    user = ForeignKeyField(User, backref='cart')
    public_id = CharField(unique=True, default=generate_public_id("cart"))
    created_at = DateTimeField(default=datetime.datetime.now)
    updated_at = DateTimeField(default=datetime.datetime.now)

    def to_dict(self):
        return {
            'id': self.id,
            'user': self.user.to_dict(),
            'public_id': self.public_id,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
```

## MODEL CARTITEM ESCRITO EM PYTHON E PEEWEE

```
class CartItem(BaseModel):
    cart = ForeignKeyField(Cart, backref='items')
    product = ForeignKeyField(Product, backref='cart_items')
    quantity = IntegerField()

    def to_dict(self):
        return {
            'id': self.id,
            'cart_id': self.cart.id,
            'product': self.product.to_dict(),
            'quantity': self.quantity
        }
```1
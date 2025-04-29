# schemas.py
from marshmallow import Schema, fields, validate

class ItemCreateSchema(Schema):
    name = fields.Str(
        required=True,
        error_messages={
            "required": "The 'name' field is required.",
            "type": "Name must be a string."
        },
        validate=validate.Length(min=1, error="Name cannot be empty.")
    )
    description = fields.Str(
         error_messages={"type": "Description must be a string."},
         load_default=None
    )

class ItemUpdateSchema(Schema):
    name = fields.Str(
        validate=validate.Length(min=1, error="Name cannot be empty."),
         error_messages={"type": "Name must be a string."}
    )
    description = fields.Str(
        allow_none=True,
        error_messages={"type": "Description must be a string or null."}
    )

# Instantiate schemas for use in routes
item_create_schema = ItemCreateSchema()
item_update_schema = ItemUpdateSchema()


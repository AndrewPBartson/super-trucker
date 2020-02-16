
exports.up = function(knex, Promise) {
  return knex.schema.createTable('way_points', function(table) {
    table.increments();
    table.decimal('lat', 8, 5 );
    table.decimal('lng', 8, 5 );
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.integer('trips_id').references('id').inTable('trips');
  });
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('way_points');
};

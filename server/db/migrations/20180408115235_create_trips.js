
exports.up = function(knex, Promise) {
  return knex.schema.createTable('trips', function(table) {
    table.increments();
    table.string('trip_name');
    table.string('origin').notNullable();
    table.string('end_point').notNullable();
    table.timestamp('depart_time').defaultTo(knex.fn.now());
    table.boolean('use_defaults').defaultTo(true);
    table.boolean('cycle_24_hr').defaultTo(true);
    table.integer('speed').defaultTo(67);
    table.decimal('hours_driving', 4, 2 ).defaultTo(11);
    table.decimal('hours_rest', 4, 2 ).defaultTo(10);
    table.string('resume_time').defaultTo('08:00');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.integer('users_id').references('id').inTable('users');
  });
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('trips');
};

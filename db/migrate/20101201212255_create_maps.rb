class CreateMaps < ActiveRecord::Migration
  def self.up
    create_table :maps do |t|
      t.string :name, :null => false
      t.integer :rows, :null => false, :default => 12
      t.integer :columns, :null => false, :default => 12
      t.text :routes
      t.timestamps
    end
  end

  def self.down
    drop_table :maps
  end
end

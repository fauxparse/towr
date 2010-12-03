class MapUsers < ActiveRecord::Migration
  def self.up
    change_table :maps do |t|
      t.belongs_to :user
    end
    
    add_index :maps, :user_id
  end

  def self.down
    change_table :maps do |t|
      t.remove :user_id
    end
  end
end

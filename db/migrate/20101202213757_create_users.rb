class CreateUsers < ActiveRecord::Migration
  def self.up
    create_table :users do |t|
      t.string :name
      t.timestamps
    end
    
    create_table :twitter_authentications do |t|
      t.integer :twitter_id
      t.string :screen_name
      t.belongs_to :user, :null => false
    end
    
    add_index :twitter_authentications, :twitter_id
    add_index :twitter_authentications, :user_id
  end

  def self.down
    drop_table :twitter_authentications
    drop_table :users
  end
end
